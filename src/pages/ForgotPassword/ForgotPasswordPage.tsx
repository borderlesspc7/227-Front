import ForgotPasswordForm from "./form/ForgotPasswordForm";
import "./ForgotPasswordPage.css";

export default function ForgotPasswordPage() {
  return (
    <div className="forgot-password-page">
      <div className="forgot-password-page__container">
        <div className="forgot-password-page__form-section">
          <ForgotPasswordForm />
        </div>

        <div className="forgot-password-page__brand-section">
          <div className="forgot-password-page__brand-content">
            <div className="forgot-password-page__logo">
              <div className="forgot-password-page__logo-icon">
                <svg viewBox="0 0 100 100" className="logo-svg"></svg>
              </div>
            </div>
            <h2 className="forgot-password-page__brand-name">AddControl</h2>
            <div className="forgot-password-page__brand-description">
              <p className="forgot-password-page__tagline">
                Recuperacao de senha
              </p>
              <p className="forgot-password-page__description">
                Não se preocupe, vamos ajudá-lo a recuperar o acesso à sua conta
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
