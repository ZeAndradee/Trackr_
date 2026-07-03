import { createPortal } from "react-dom";
import { useEffect, useContext } from "react";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import { UserLoggedContext } from "../../../contexts/UserLoggedContext";
import Login from "../Login/Login";
import Signup from "../Signup/Signup";
import ForgotPassword from "../ForgotPassword/ForgotPassword";
import LoginReason from "../LoginReason/LoginReason";
import VerifyEmailInstruction from "../VerifyEmail/VerifyEmailInstruction";
import styles from "./AuthModal.module.css";
import { FiX } from "react-icons/fi";
import useScrollLock from "../../../hooks/useScrollLock";

const AuthModalContent = () => {
  const { closeModal, view } = useAuthModal();
  const { userLogged } = useContext(UserLoggedContext);
  useScrollLock();

  useEffect(() => {
    const root = document.getElementById("root");
    if (root) {
      root.classList.add("app-blurred");
    }

    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      if (root) {
        root.classList.remove("app-blurred");
      }
      window.removeEventListener("keydown", handleEsc);
    };
  }, [closeModal]);

  return createPortal(
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButton}
          onClick={closeModal}
          aria-label="Close modal"
        >
          <FiX size={24} />
        </button>
        {view === "login" && <Login />}
        {view === "signup" && <Signup />}
        {view === "forgot-password" && <ForgotPassword />}
        {view === "login-reason" && <LoginReason />}
        {view === "verify-email-instruction" && (
          <VerifyEmailInstruction email={userLogged?.email} />
        )}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

const AuthModal = () => {
  const { isOpen } = useAuthModal();

  if (!isOpen) return null;

  return <AuthModalContent />;
};

export default AuthModal;
