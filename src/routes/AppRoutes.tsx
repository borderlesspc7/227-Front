import { BrowserRouter, Routes, Route } from "react-router-dom";
import { paths } from "./paths";
import { ProtectedRoute } from "./ProtectedRoute";
import LoginPage from "../pages/LoginPage/LoginPage";
import { AdminLayout } from "../components/Layout/AdminLayout/AdminLayout";
import { RegisterPage } from "../pages/RegisterPage/RegisterPage";
import { ContractsPage } from "../pages/Contracts/ContractsPage";
import PricesPage from "../pages/Prices/PricePage";
import AdditiveRequestPage from "../pages/AdditiveRequest/AdditiveRequestPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ApprovalsPage from "../pages/Approvals/ApprovalsPage";
import { ItemsPage } from "../pages/Items/ItemsPage";
import FormalizationPage from "../pages/Formalization/FormalizationPage";
import SignaturesPage from "../pages/Signatures/SignaturesPage";
import { CompanyRegisterPage } from "../pages/CompanyRegister/CompanyRegisterPage";
import { ProfilePage } from "../pages/Profile/ProfilePage";
import { ErrorBoundary } from "../components/ui/ErrorBoundary/ErrorBoundary";
import { ToastProvider } from "../contexts/toastContext";
import type { UserRole } from "../types/auth";

export default function AppRoutes() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path={paths.home} element={<LoginPage />} />
            <Route path={paths.login} element={<LoginPage />} />
            <Route path={paths.registerCompany} element={<CompanyRegisterPage />} />
            <Route
              path={paths.dashboard}
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route 
                index 
                element={
                  <ProtectedRoute roles={["admin", "diretor", "engenheiro", "solicitante", "suprimento", "cliente"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute roles={["admin", "diretor", "engenheiro", "solicitante", "suprimento", "cliente"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="register-user" 
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <RegisterPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="contracts" 
                element={
                  <ProtectedRoute roles={["admin", "diretor", "engenheiro", "solicitante", "suprimento"]}>
                    <ContractsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="prices" 
                element={
                  <ProtectedRoute roles={["admin", "diretor", "engenheiro", "solicitante", "suprimento"]}>
                    <PricesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="additive-requests" 
                element={
                  <ProtectedRoute roles={["admin", "diretor", "engenheiro", "solicitante"]}>
                    <AdditiveRequestPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="items" 
                element={
                  <ProtectedRoute roles={["admin", "diretor", "engenheiro", "solicitante", "suprimento"]}>
                    <ItemsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="approvals" 
                element={
                  <ProtectedRoute roles={["admin", "diretor", "solicitante", "cliente"]}>
                    <ApprovalsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="formalization" 
                element={
                  <ProtectedRoute roles={["admin", "diretor", "engenheiro", "solicitante", "cliente"]}>
                    <FormalizationPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="signatures" 
                element={
                  <ProtectedRoute roles={["admin", "diretor", "engenheiro", "solicitante", "cliente"]}>
                    <SignaturesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="profile" 
                element={
                  <ProtectedRoute roles={["admin", "diretor", "engenheiro", "solicitante", "suprimento", "cliente"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
            </Route>
            <Route
              path={paths.adminRoot}
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path={paths.adminRegisterUser} element={<RegisterPage />} />
              <Route path="register-user" element={<RegisterPage />} />
              <Route path={paths.adminContracts} element={<ContractsPage />} />
              <Route path={paths.adminPrices} element={<PricesPage />} />
              <Route
                path={paths.adminAdditiveRequests}
                element={<AdditiveRequestPage />}
              />
              <Route path="items" element={<ItemsPage />} />
              <Route path={paths.adminApprovals} element={<ApprovalsPage />} />
              <Route path={paths.adminFormalization} element={<FormalizationPage />} />
              <Route path={paths.adminSignatures} element={<SignaturesPage />} />
              <Route path={paths.adminProfile} element={<ProfilePage />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </ToastProvider>
  );
}
