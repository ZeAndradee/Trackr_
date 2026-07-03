import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserLoggedContext } from "../../../contexts/UserLoggedContext";
import styles from "./Login.module.css";
import { validateEmail } from "../../Utils/Validators/AuthValidator";
import { useAuth } from "../../../contexts/AuthContext";
import { initiateGoogleLogin } from "../../../services/Auth/GoogleAuth";
import { FcGoogle } from "react-icons/fc";
import { Button } from "../../Utils/Buttons/Button";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import HandleError from "../../Utils/HandleError/HandleError";
import { TextInput, Checkbox } from "../../Utils/Inputs/Inputs";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUserLogged } = useContext(UserLoggedContext);
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const { closeModal, switchView } = useAuthModal();
  const { loginUser } = useAuth();

  const login = async () => {
    setErrorMessage("");
    setLoading(true);

    if (!email || !password) {
      setErrorMessage("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const userData = await loginUser(email, password);
      setUserLogged(userData);
      closeModal();
    } catch (error) {
      console.error("Login error:", error);
      if (error.message === "Email or password are incorrect.") {
        setErrorMessage("Incorrect email or password. Please try again.");
      } else if (error.message === "An error occurred during login.") {
        setErrorMessage("An error occurred. Please try again.");
      } else if (error.message && error.message.includes("Network Error")) {
        setErrorMessage(
          "Network error. Please check your internet connection."
        );
      } else {
        setErrorMessage(
          error.message || "Failed to log in. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContent}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to continue to Trackr</p>
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          login();
        }}
      >
        <div className={styles.socialButtons}>
          <button
            type="button"
            className={styles.socialButton}
            onClick={initiateGoogleLogin}
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>
        </div>

        <div className={styles.divider}>
          <div className={styles.line}></div>
          <span>Or confirm your email</span>
          <div className={styles.line}></div>
        </div>
        <TextInput
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          label="Email address"
          mandatory
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrorMessage("");
          }}
          required
        />

        <TextInput
          type="password"
          id="password"
          name="password"
          autoComplete="current-password"
          label="Password"
          mandatory
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrorMessage("");
          }}
          required
        />

        <div className={styles.options}>
          <Checkbox
            id="rememberMe"
            label="Remember me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span
            className={styles.forgotPassword}
            onClick={() => switchView("forgot-password")}
          >
            Forgot password?
          </span>
        </div>

        <HandleError error={errorMessage} />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        <div className={styles.footer}>
          Don't have an account?
          <span
            className={styles.signupLink}
            onClick={() => switchView("signup")}
          >
            Sign up
          </span>
        </div>
      </form>
    </div>
  );
};

export default Login;
