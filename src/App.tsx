import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/authContext";
import { systemInitializer } from "./services/systemInitializer";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    // Inicializar sistema com dados padrão se necessário
    const initializeSystem = async () => {
      try {
        const needsInit = await systemInitializer.needsInitialization();
        if (needsInit) {
          await systemInitializer.initializeSystem();
        }
      } catch (error) {
        console.error("Erro ao inicializar sistema:", error);
      }
    };

    initializeSystem();
  }, []);

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
