import { auth, db, app } from "../lib/firebaseconfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type Unsubscribe,
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { getAuth as getAuthFromApp } from "firebase/auth";
import { initializeApp, deleteApp } from "firebase/app";
import type {
  LoginCredentials,
  RegisterCredentials,
  UserRegisterCredentials,
  User,
} from "../types/auth";
import { subscriptionService } from "./subscriptionService";
import type { Company } from "../types/subscription";
import { sendPasswordResetEmail } from "firebase/auth";
import getFirebaseErrorMessage from "../components/ui/ErrorMessages";

export const authService = {
  async logOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error("Error logging out:" + error);
    }
  },

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      // Validação de CNPJ se fornecido
      if (
        credentials.cnpj &&
        !subscriptionService.validateCNPJ(credentials.cnpj)
      ) {
        throw new Error("CNPJ inválido");
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        throw new Error("Usuário não encontrado");
      }

      const userData = userDoc.data() as User;

      // Verificar se o CNPJ fornecido corresponde ao da empresa do usuário
      if (credentials.cnpj && userData.companyId) {
        const company = await subscriptionService.getCompanyById(
          userData.companyId
        );
        if (!company || company.cnpj !== credentials.cnpj) {
          throw new Error("CNPJ não corresponde à empresa do usuário");
        }
      }

      const updateUserData = {
        ...userData,
        lastLoginAt: new Date(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), updateUserData);

      return updateUserData;
    } catch (error) {
      const message = getFirebaseErrorMessage(error);
      throw new Error(message);
    }
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      // Validação de CNPJ
      if (!subscriptionService.validateCNPJ(credentials.companyCnpj)) {
        throw new Error("CNPJ da empresa inválido");
      }

      // Verificar se empresa já existe
      const existingCompany = await subscriptionService.getCompanyByCNPJ(
        credentials.companyCnpj
      );
      if (existingCompany) {
        throw new Error("Empresa com este CNPJ já está cadastrada");
      }

      // Criação via app secundário para não afetar a sessão do admin atual
      const secondaryApp = initializeApp(app.options, "secondary");
      const secondaryAuth = getAuthFromApp(secondaryApp);

      try {
        const userCredential = await createUserWithEmailAndPassword(
          secondaryAuth,
          credentials.email,
          credentials.password
        );

        const firebaseUser = userCredential.user;

        // Criar empresa primeiro
        const now = new Date();
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 dias de trial

        const companyData: Omit<Company, "id" | "createdAt" | "updatedAt"> = {
          cnpj: credentials.companyCnpj,
          companyName: credentials.companyName,
          email: credentials.email,
          phone: credentials.phone,
          address: credentials.companyAddress,
          subscription: {
            plan: credentials.subscriptionPlan,
            status: "trial",
            startDate: now,
            endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 dias
            trialEndDate,
            autoRenew: true,
          },
          createdBy: firebaseUser.uid,
        };

        const company = await subscriptionService.createCompany(companyData);

        // Criar usuário
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? credentials.email,
          cnpj: credentials.companyCnpj,
          companyId: company.id,
          displayName: credentials.displayName,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          role: credentials.role,
          isActive: true,
        };

        await setDoc(doc(db, "users", firebaseUser.uid), {
          ...userData,
          createdAt: Timestamp.fromDate(userData.createdAt),
          lastLoginAt: Timestamp.fromDate(userData.lastLoginAt),
        });

        // Inicializar uso da empresa
        await subscriptionService.updateCompanyUsage(company.id, {
          companyId: company.id,
          activeContracts: 0,
          totalUsers: 1,
          totalItems: 0,
          totalFormalizations: 0,
          totalAdditiveRequests: 0,
          storageUsedGB: 0,
          lastUpdated: new Date(),
        });

        return userData;
      } finally {
        // Garante que o app secundário seja limpo
        await secondaryAuth.signOut().catch(() => undefined);
        await deleteApp(secondaryApp).catch(() => undefined);
      }
    } catch (error) {
      throw new Error("Erro ao registrar usuário: " + error);
    }
  },

  async registerForAdmin(credentials: UserRegisterCredentials): Promise<User> {
    try {
      // Criação via app secundário para não afetar a sessão do admin atual
      const secondaryApp = initializeApp(app.options, "secondary-admin");
      const secondaryAuth = getAuthFromApp(secondaryApp);

      try {
        const firebaseUser = await createUserWithEmailAndPassword(
          secondaryAuth,
          credentials.email,
          credentials.password
        );

        // Criar usuário sem empresa (para administradores)
        const userData: User = {
          uid: firebaseUser.user.uid,
          email: firebaseUser.user.email ?? credentials.email,
          displayName: credentials.displayName,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          role: credentials.role,
          isActive: true,
        };

        await setDoc(doc(db, "users", firebaseUser.user.uid), {
          ...userData,
          createdAt: Timestamp.fromDate(userData.createdAt),
          lastLoginAt: Timestamp.fromDate(userData.lastLoginAt),
        });

        return userData;
      } finally {
        // Garante que o app secundário seja limpo
        await secondaryAuth.signOut().catch(() => undefined);
        await deleteApp(secondaryApp).catch(() => undefined);
      }
    } catch (error) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  },

  observeAuthState(callback: (user: User | null) => void): Unsubscribe {
    try {
      return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Usuário está logado, busca dados completos no Firestore
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data() as User;
              callback(userData);
            } else {
              callback(null); // Usuário não encontrado no Firestore
            }
          } catch (error: any) {
            console.error("Erro ao buscar dados do usuário:", error);
            if (error.code === "permission-denied") {
              console.error(
                "⚠️ PERMISSÃO NEGADA: Verifique as regras do Firestore!"
              );
              console.error(
                "A coleção 'users' precisa permitir leitura para o próprio usuário."
              );
              console.error(
                "Configure as regras em: Firebase Console → Firestore Database → Rules"
              );
              console.error(
                "Veja o arquivo FIREBASE_STORAGE_RULES.md para instruções detalhadas."
              );
            }
            callback(null);
          }
        } else {
          // Usuário não está logado
          callback(null);
        }
      });
    } catch (error) {
      throw new Error("Erro ao observar estado de autenticação: " + error);
    }
  },

  async updateUserCompanyId(userId: string, companyId: string): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        companyId: companyId,
        updatedAt: Timestamp.now(),
      });
      console.log(
        "CompanyId atualizado para o usuário:",
        userId,
        "CompanyId:",
        companyId
      );
    } catch (error) {
      console.error("Erro ao atualizar companyId do usuário:", error);
      throw new Error("Erro ao atualizar companyId do usuário");
    }
  },

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const message = getFirebaseErrorMessage(error);
      throw new Error(message);
    }
  },
};
