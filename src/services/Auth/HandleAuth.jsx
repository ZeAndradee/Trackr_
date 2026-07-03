import useApi from "../../hooks/Api";
import { validateImageFile } from "../../components/Utils/Validators/ImageValidator";

const api = useApi();

export const handleSignup = async (signUpInfo) => {
  try {
    if (signUpInfo?.profileImage) {
      const validation = validateImageFile(signUpInfo.profileImage);
      if (!validation.valid) {
        return {
          status: 400,
          data: { message: validation.message },
        };
      }
    }

    const formData = new FormData();

    formData.append("username", signUpInfo?.username);
    formData.append("email", signUpInfo?.email);
    formData.append("password", signUpInfo?.password);

    if (signUpInfo?.name) formData.append("name", signUpInfo?.name);
    if (signUpInfo?.bio) formData.append("bio", signUpInfo?.bio);
    if (signUpInfo?.location) formData.append("location", signUpInfo?.location);
    if (signUpInfo?.authProvider)
      formData.append("authProvider", signUpInfo?.authProvider);

    if (signUpInfo?.profileImage) {
      formData.append("profileImage", signUpInfo?.profileImage);
    }

    const { data: result } = await api.post("/auth/signup", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return result;
  } catch (e) {
    return e?.response;
  }
};

export const handleSignupCheck = async (email) => {
  try {
    const { data: checkResult } = await api.post("/auth/scheck", {
      email: email,
    });

    return checkResult;
  } catch (e) {
    return e;
  }
};

export const handleLogin = async (credentials) => {
  try {
    const response = await api.post("/auth/login", {
      email: credentials?.email,
      password: credentials?.password,
    });

    return response;
  } catch (e) {
    return e?.response;
  }
};

export const handleLogout = async () => {
  const { data: response } = await api.post("/auth/logout");

  if (response.res) {
    window.location.reload();
  }

  return false;
};

export const checkAuth = async () => {
  try {
    const { data: checkResponse } = await api.post("/auth/check");

    return checkResponse?.data;
  } catch (e) {
    console.error(e);
  }
};

export const verifyResetToken = async (token) => {
  try {
    const { data } = await api.get(`/auth/verify-reset-token/${token}`);
    return data;
  } catch (e) {
    throw e;
  }
};

export const resetPassword = async (token, password) => {
  try {
    const { data } = await api.post("/auth/reset-password", {
      token,
      password,
    });
    return data;
  } catch (e) {
    throw e;
  }
};

export const verifyEmail = async (token) => {
  try {
    const { data } = await api.post(`/auth/verify-email?token=${token}`);
    return data;
  } catch (e) {
    throw e;
  }
};

export const resendVerificationEmail = async (email) => {
  try {
    const { data } = await api.post("/auth/resend-verification", {
      email,
    });
    return data;
  } catch (e) {
    throw e;
  }
};
