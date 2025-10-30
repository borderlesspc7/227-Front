import { db } from "../lib/firebaseconfig";
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy, getDoc } from "firebase/firestore";

export interface User {
    id: string;
    displayName: string;
    email: string;
    role: string;
    cpf: string;
    phone: string;
    createdAt: Date;
    lastLoginAt?: Date;
}

export const userService = {
    async getUsers(): Promise<User[]> {
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                lastLoginAt: doc.data().lastLoginAt?.toDate(),
            })) as User[];
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            throw error;
        }
    },

    async getUserById(userId: string): Promise<User | null> {
        try {
            if (!userId) return null;
            const snap = await getDoc(doc(db, "users", userId));
            if (!snap.exists()) return null;
            const data: any = snap.data();
            return {
                id: snap.id,
                displayName: data.displayName || "",
                email: data.email || "",
                role: data.role || "",
                phone: data.phone || "",
                createdAt: data?.createdAt?.toDate?.() || new Date(),
                lastLoginAt: data?.lastLoginAt?.toDate?.(),
            } as User;
        } catch (error) {
            console.error("Erro ao buscar usuário por ID:", error);
            return null;
        }
    },

    async deleteUser(userId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, "users", userId));
        } catch (error) {
            console.error("Erro ao deletar usuário:", error);
            throw error;
        }
    },

    async updateUser(userId: string, userData: Partial<User>): Promise<void> {
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                ...userData,
                updatedAt: new Date(),
            });
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            throw error;
        }
    },
};
