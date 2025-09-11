import { BrowserRouter, Routes, Route } from "react-router-dom";
import { paths } from "./paths";
import { ProtectedRoute } from "./ProtectedRoute";
import LoginPage from "../pages/LoginPage/LoginPage";
import { AdminLayout } from "../components/Layout/AdminLayout/AdminLayout";
import { RegisterPage } from "../pages/RegisterPage/RegisterPage";
import { ContractsPage } from "../pages/Contracts/ContractsPage";
import PricesPage from "../pages/Prices/PricePage";
import AdditiveRequestPage from "../pages/AdditiveRequest/AdditiveRequestPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<LoginPage />} />
        <Route path={paths.login} element={<LoginPage />} />
        <Route
          path={paths.adminRoot}
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RegisterPage />} />
          <Route path={paths.adminRegisterUser} element={<RegisterPage />} />
          <Route path="register-user" element={<RegisterPage />} />
          <Route path={paths.adminContracts} element={<ContractsPage />} />
          <Route path={paths.adminPrices} element={<PricesPage />} />
          <Route
            path={paths.adminAdditiveRequests}
            element={<AdditiveRequestPage />}
          />
          {/* Outras rotas admin: contratos, preços, etc */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
