import React, { useState, useEffect } from "react";
import style from "./VerifyEmailInstruction.module.css";
import { FiMail, FiClock } from "react-icons/fi";
import { Button } from "../../Utils/Buttons/Button";
import { resendVerificationEmail } from "../../../services/Auth/HandleAuth";
import HandleError from "../../Utils/HandleError/HandleError";

const VerifyEmailInstruction = ({ email }) => {

  const [timeLeft, setTimeLeft] = useState(0);
  const [resending, setResending] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  const TIMER_DURATION = 60;
  const STORAGE_KEY = `resend_email_timer_${email}`;

  useEffect(() => {
    const savedTime = localStorage.getItem(STORAGE_KEY);
    if (savedTime) {
      const expiryTime = parseInt(savedTime, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      const remaining = expiryTime - currentTime;

      if (remaining > 0) {
        setTimeLeft(remaining);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [email, STORAGE_KEY]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            localStorage.removeItem(STORAGE_KEY);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, STORAGE_KEY]);

  const handleResend = async () => {
    setResending(true);
    setMessage("");
    setError(null);
    try {
      await resendVerificationEmail(email);
      setMessage("Email sent successfully!");

      const expiryTime = Math.floor(Date.now() / 1000) + TIMER_DURATION;
      localStorage.setItem(STORAGE_KEY, expiryTime.toString());
      setTimeLeft(TIMER_DURATION);
    } catch (error) {
      console.error("Failed to resend email", error);
      setError("Failed to send email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={style.container}>
      <div className={style.card}>
        <div className={style.successContainer}>
          <FiMail className={style.successIcon} size={50} />
          <h1 className={style.title}>Check your email</h1>
          <p className={style.subtitle}>
            We sent a confirmation link to <strong>{email}</strong>.
            <br />
            Please check your inbox to activate your account.
          </p>

          <HandleError error={error} />

          <div className={style.buttonGroup}>
            <Button
              variant="secondary"
              onClick={handleResend}
              disabled={timeLeft > 0 || resending}
              fullWidth
            >
              {resending ? (
                "Sending..."
              ) : timeLeft > 0 ? (
                <span className={style.timerText}>
                  <FiClock style={{ marginRight: "5px" }} /> Resend in{" "}
                  {timeLeft}s
                </span>
              ) : (
                "Resend Email"
              )}
            </Button>
          </div>

          {message && <p className={style.statusMessage}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailInstruction;
