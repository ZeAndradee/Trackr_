export const validateEmail = (email) => {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const validateRequired = (value) => {
  return value && value.trim() !== "";
};

export const validateUsername = (username) => {
  if (!username || username.trim() === "") {
    return { valid: false, message: "Username is required." };
  }

  if (username.length < 3 || username.length > 16) {
    return {
      valid: false,
      message: "Username must be between 3 and 16 characters long.",
    };
  }

  if (username.includes(" ")) {
    return { valid: false, message: "Username cannot contain spaces." };
  }

  return { valid: true };
};

export const validateDisplayName = (displayName) => {
  if (displayName && displayName.length > 30) {
    return {
      valid: false,
      message: "Display name must be at most 30 characters long.",
    };
  }
  return { valid: true };
};

export const verifySignupCredentials = (email, password) => {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  if (!emailRegex.test(email)) {
    return { response: false, message: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return {
      response: false,
      message:
        "Your password is too short. It must be at least 8 characters long.",
    };
  }

  return { response: true };
};

export const verifyUsername = (username) => {
  if (username.length < 3 || username?.length > 16) {
    return "Your username must be between 3 and 16 characters long.";
  }

  if (username.includes(" ")) {
    return "Username cannot contain spaces.";
  }

  return { response: true };
};

export const verifyLoginCredentials = (email, password) => {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  if (!emailRegex.test(email)) {
    return { response: false, message: "Please enter a valid email address." };
  }

  if (password.length < 8) {
    return {
      response: false,
      message:
        "Your password is too short. It must be at least 8 characters long.",
    };
  }

  return { response: true };
};
