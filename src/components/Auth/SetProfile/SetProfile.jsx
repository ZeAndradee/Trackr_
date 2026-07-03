import React, { useState, useRef, useEffect } from "react";
import style from "./SetProfile.module.css";
import { useNavigate } from "react-router-dom";
import { handleSignup } from "../../../services/Auth/HandleAuth";
import {
  validateUsername,
  validateDisplayName,
} from "../../Utils/Validators/AuthValidator";
import { validateImageFile } from "../../Utils/Validators/ImageValidator";
import { Button } from "../../Utils/Buttons/Button";
import { FiChevronLeft, FiEdit2, FiMail } from "react-icons/fi";
import { FaCheck } from "react-icons/fa";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import VerifyEmailInstruction from "../VerifyEmail/VerifyEmailInstruction";
import ImageCropper from "../../Utils/Images/ImageCropper/ImageCropper";
import Image from "../../Utils/Images/Image/Image";
import { TextInput, TextArea } from "../../Utils/Inputs/Inputs";

const SetProfile = ({ credentials, onGoBack, onSuccess, ...props }) => {
  const [error, setError] = useState();
  const [profileData, setProfileData] = useState({
    username: "",
    name: "",
    bio: "",
    location: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [profileImage, setprofileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState(null);
  const fileInputRef = useRef(null);
  const { switchView } = useAuthModal();
  const navigate = useNavigate();

  useEffect(() => {
    if (props.googleProfile) {
      setProfileData((prev) => ({
        ...prev,
        name: props.googleProfile.name || "",
      }));
    }
  }, [props.googleProfile]);

  const handleInputChange = (value, field) => {
    setProfileData({
      ...profileData,
      [field]: value,
    });
    setError(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError({
        message: validation.message,
      });
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setCropperImage(reader.result);
      setShowCropper(true);
    });
    reader.readAsDataURL(file);

    e.target.value = null;
  };

  const onCropComplete = (croppedBlob) => {
    setprofileImage(croppedBlob);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(croppedBlob);
    setShowCropper(false);
  };

  const onCropCancel = () => {
    setShowCropper(false);
    setCropperImage(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const signup = async () => {
    setLoading(true);
    setError(null);

    const validation = validateUsername(profileData.username);
    if (!validation.valid) {
      setError({ message: validation.message });
      setLoading(false);
      return;
    }

    const nameValidation = validateDisplayName(profileData.name);
    if (!nameValidation.valid) {
      setError({ message: nameValidation.message });
      setLoading(false);
      return;
    }

    try {
      const signupData = {
        email: credentials?.email,
        password: credentials?.password,
        username: profileData.username,
        name: profileData.name,
        bio: profileData.bio,
        location: profileData.location,
        profileImage: profileImage,
        authProvider: props.googleProfile ? "google" : "email",
      };

      const resultSignup = await handleSignup(signupData);

      if (resultSignup?.status === 409) {
        setError({
          status: 409,
          message: "This username is already in use. Try another one.",
        });
      } else if (resultSignup?.status === 200) {
        setSuccess(true);
        setEmailSent(true);
      }
    } catch (err) {
      setError({
        message: "An error occurred during sign up. Please try again.",
      });
      console.error("Sign up error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <VerifyEmailInstruction
        email={credentials?.email}
        onLogin={() => {
          if (switchView) switchView("login");
          else navigate("/");
        }}
      />
    );
  }

  return (
    <div className={style.container}>
      {!showCropper && (
        <div className={style.card}>
          <button className={style.backButton} onClick={onGoBack}>
            <FiChevronLeft /> Back
          </button>

          <div className={style.header}>
            <h1 className={style.title}>Complete Profile</h1>
            <p className={style.subtitle}>Tell us more about yourself</p>
          </div>

          <div className={style.profileImageSection}>
            <div className={style.profileImageContainer}>
              <Image
                src={imagePreview}
                name={profileData.name || profileData.username}
                size={100}
                showBadge={false}
              />
              <button
                className={style.uploadButton}
                onClick={triggerFileInput}
                type="button"
              >
                <FiEdit2 size={14} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className={style.imageInput}
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <span className={style.imageHint}>Add a profile picture</span>
          </div>

          <div className={style.form}>
            <div className={style.inputGroup}>
              <TextInput
                label="Username"
                mandatory
                placeholder="@username"
                value={profileData.username}
                onChange={(e) => handleInputChange(e.target.value, "username")}
                required
                maxLength={16}
                minLength={3}
              />
            </div>

            <div className={style.inputGroup}>
              <TextInput
                label="Display Name"
                placeholder="Your Name"
                value={profileData.name}
                onChange={(e) => handleInputChange(e.target.value, "name")}
                maxLength={30}
              />
              <span className={style.helperText}>
                The name displayed on your profile.
              </span>
            </div>

            <div className={style.inputGroup}>
              <TextArea
                label="Bio"
                value={profileData.bio}
                onChange={(e) => handleInputChange(e.target.value, "bio")}
                placeholder="Tell others about yourself"
                maxLength={160}
                showCounter
              />
            </div>

            {error && <div className={style.errorMessage}>{error.message}</div>}

            <Button
              variant="primary"
              onClick={signup}
              disabled={loading || !profileData.username}
              fullWidth
            >
              {loading ? (
                <span className={style.loadingText}>Creating profile...</span>
              ) : success ? (
                <span className={style.successText}>
                  <FaCheck /> Profile Created!
                </span>
              ) : (
                "Create Profile"
              )}
            </Button>
          </div>
        </div>
      )}

      {showCropper && cropperImage && (
        <ImageCropper
          imageSrc={cropperImage}
          onCropComplete={onCropComplete}
          onCancel={onCropCancel}
          outputWidth={512}
          outputHeight={512}
          cropShape="round"
          title="Edit profile picture"
        />
      )}
    </div >
  );
};
export default SetProfile;
