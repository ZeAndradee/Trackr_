import { useState, useEffect, useCallback } from "react";
import { updateUserProfile } from "../services/FetchUser";
import {
  validateUsername,
  validateDisplayName,
} from "../components/Utils/Validators/AuthValidator";
import { validateImageFile } from "../components/Utils/Validators/ImageValidator";

const useEditProfileForm = (
  initialUserData,
  userLogged,
  setUserLogged,
  onClose
) => {
  const [formData, setFormData] = useState({
    name: initialUserData?.name || "",
    username: initialUserData?.username || "",
    bio: initialUserData?.bio || "",
    location: initialUserData?.location || "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    initialUserData?.userimage || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (initialUserData) {
      setFormData({
        name: initialUserData.name || "",
        username: initialUserData.username || "",
        bio: initialUserData.bio || "",
        location: initialUserData.location || "",
      });
      setImagePreview(initialUserData.userimage || "");
    }
  }, [initialUserData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.message);
      return;
    }

    setErrorMessage("");
    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback(
    async (favoriteTrackIds) => {
      setIsSubmitting(true);
      setErrorMessage("");

      const usernameValidation = validateUsername(formData.username);
      if (!usernameValidation.valid) {
        setErrorMessage(usernameValidation.message);
        setIsSubmitting(false);
        return;
      }

      const nameValidation = validateDisplayName(formData.name);
      if (!nameValidation.valid) {
        setErrorMessage(nameValidation.message);
        setIsSubmitting(false);
        return;
      }

      try {
        const formDataToSend = new FormData();
        Object.keys(formData).forEach((key) => {
          formDataToSend.append(key, formData[key]);
        });
        if (profileImage) {
          formDataToSend.append("profileImage", profileImage);
        }
        formDataToSend.append(
          "favorite_tracks",
          JSON.stringify(favoriteTrackIds)
        );

        const response = await updateUserProfile(formDataToSend);

        if (response && response.status === 200) {
          if (setUserLogged) {
            setUserLogged({
              ...userLogged,
              ...formData,
              userimage: response.data?.userimage || imagePreview,
            });
          }
          setSendSuccess(true);
          if (typeof onClose === "function") {
            onClose();
          }
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("profileUpdated"));
            if (initialUserData?.username !== formData.username) {
              window.location.href = `/${formData.username}`;
            } else {
              window.location.reload();
            }
          }, 100);
        } else {
          setErrorMessage(response?.message || "Failed to update profile.");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        setErrorMessage(error?.response?.data?.message || "An error occurred.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      profileImage,
      initialUserData,
      userLogged,
      setUserLogged,
      onClose,
      imagePreview,
    ]
  );

  return {
    formData,
    handleInputChange,
    profileImage,
    imagePreview,
    handleImageChange,
    isSubmitting,
    sendSuccess,
    errorMessage,
    handleSubmit,
    setErrorMessage,
  };
};

export default useEditProfileForm;
