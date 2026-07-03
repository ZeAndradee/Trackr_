import { FiAlertTriangle } from "react-icons/fi";
import styles from "./HandleError.module.css";

export const getErrorMessage = (status, customMessages) => {
  if (status >= 500) {
    return "Something went wrong. Please try again later.";
  }

  if (customMessages && typeof customMessages === "object") {
    if (customMessages[status]) {
      return customMessages[status];
    }
  } else if (customMessages && typeof customMessages === "string") {
    return customMessages;
  }

  switch (status) {
    case 400:
      return "Invalid request. Please check your data.";
    case 401:
      return "You are not authorized to perform this action.";
    case 403:
      return "Access denied.";
    case 404:
      return "Resource not found.";
    case 409:
      return "This record already exists.";
    default:
      return "An unexpected error occurred.";
  }
};

const HandleError = ({ error, customMessages, className, style, title }) => {
  if (!error) return null;

  const errorMessage =
    typeof error === "number" ? getErrorMessage(error, customMessages) : error;

  return (
    <div className={`${styles.container} ${className || ""}`} style={style}>
      <div className={styles.iconWrapper}>
        <FiAlertTriangle size={20} />
      </div>
      <div className={styles.content}>
        {title && <h4 className={styles.title}>{title}</h4>}
        <p className={styles.message}>{errorMessage}</p>
      </div>
    </div>
  );
};

export default HandleError;
