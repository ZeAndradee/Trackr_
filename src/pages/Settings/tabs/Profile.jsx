import { useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useBlocker } from "react-router-dom";
import { FiUpload, FiTrash2, FiChevronDown, FiSearch } from "react-icons/fi";
import { countries as countryCodes, hasFlag } from "country-flag-icons";
import SettingsTab from "./SettingsTab";
import { TextInput, TextArea } from "../../../components/Utils/Inputs/Inputs";
import { Button } from "../../../components/Utils/Buttons/Button";
import Flag, { resolveCountryCode, getCountryName } from "../../../components/Utils/Flag/Flag";
import UserSidebarCard from "../../../components/User/UserProfile/UserSidebarCard/UserSidebarCard";
import Image from "../../../components/Utils/Images/Image/Image";
import ImageCropper from "../../../components/Utils/Images/ImageCropper/ImageCropper";
import { UserLoggedContext } from "../../../contexts/UserLoggedContext";
import { fetchUser, updateUserProfile } from "../../../services/FetchUser";
import showToast from "../../../components/Utils/Toast/Toast";
import {
  validateImageFile,
  isGif,
  IMAGE_ACCEPT_ATTR,
  formatBytes,
} from "../../../components/Utils/Validators/ImageValidator";
import style from "./Profile.module.css";

const BIO_MAX = 160;
const NAME_MAX = 30;

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const COUNTRY_LIST = (() => {
  const regionNames =
    typeof Intl !== "undefined" && Intl.DisplayNames
      ? new Intl.DisplayNames(["en"], { type: "region" })
      : null;
  const list = [];
  for (const code of countryCodes) {
    if (!hasFlag(code)) continue;
    let name = code;
    try {
      name = regionNames?.of(code) || code;
    } catch { }
    list.push({ code, name });
  }
  list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
})();

const CountrySelect = ({ value, onChange, styles }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);
  const code = useMemo(() => resolveCountryCode(value), [value]);
  const name = useMemo(() => getCountryName(value), [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_LIST;
    return COUNTRY_LIST.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div ref={wrapRef} className={styles.countrySelectWrap}>
      <button
        type="button"
        className={styles.countrySelectButton}
        onClick={() => setOpen((v) => !v)}
      >
        {code ? (
          <>
            <Flag country={code} size={20} showTooltip={false} />
            <span>{name}</span>
          </>
        ) : (
          <span className={styles.countrySelectPlaceholder}>Select country</span>
        )}
        <FiChevronDown size={16} className={styles.countrySelectChevron} />
      </button>
      {open && (
        <div className={styles.countrySelectMenu}>
          <div className={styles.countrySelectSearch}>
            <FiSearch size={14} />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search countries"
            />
          </div>
          <div className={styles.countrySelectList}>
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                className={`${styles.countrySelectItem} ${c.code === code ? styles.countrySelectItemActive : ""}`}
                onClick={() => {
                  onChange(c.name);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <Flag country={c.code} size={20} showTooltip={false} />
                <span>{c.name}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className={styles.countrySelectEmpty}>No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Profile = () => {
  const { userLogged, setUserLogged } = useContext(UserLoggedContext) || {};

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const [initialState, setInitialState] = useState(null);
  const [alertPulse, setAlertPulse] = useState(false);
  const [barEntering, setBarEntering] = useState(false);

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [cropper, setCropper] = useState(null);

  const username = userLogged?.username || profile?.username || "";

  const captureInitialState = useCallback((u) => ({
    displayName: u.name || "",
    bio: u.bio || "",
    country: u.location || u.country || "",
    avatarPreview: u.userimage || null,
    bannerPreview: u.userbanner || null,
  }), []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!userLogged?.username) return;
      setLoading(true);
      const data = await fetchUser({ username: userLogged.username });
      if (cancelled) return;
      const u = data?.user || data;
      if (u) {
        setProfile(u);
        setDisplayName(u.name || "");
        setBio(u.bio || "");
        setCountry(u.location || u.country || "");
        setAvatarPreview(u.userimage || null);
        setBannerPreview(u.userbanner || null);
        setInitialState(captureInitialState(u));
      }
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [userLogged?.username, captureInitialState]);

  const hasUnsavedChanges = useMemo(() => {
    if (!initialState || loading) return false;
    return (
      displayName !== initialState.displayName ||
      bio !== initialState.bio ||
      country !== initialState.country ||
      avatarPreview !== initialState.avatarPreview ||
      bannerPreview !== initialState.bannerPreview
    );
  }, [initialState, loading, displayName, bio, country, avatarPreview, bannerPreview]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (hasUnsavedChanges) {
      setBarEntering(true);
      const t = setTimeout(() => setBarEntering(false), 400);
      return () => clearTimeout(t);
    }
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (blocker.state === "blocked") {
      setAlertPulse(false);
      requestAnimationFrame(() => setAlertPulse(true));
      const timer = setTimeout(() => setAlertPulse(false), 650);
      return () => clearTimeout(timer);
    }
  }, [blocker]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const countryName = useMemo(() => getCountryName(country), [country]);

  const handleAvatarPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = null;
    if (!file) return;
    const result = validateImageFile(file);
    if (!result.valid) {
      showToast(result.message, "error");
      return;
    }
    if (isGif(file)) {
      setAvatarFile(file);
      setAvatarPreview(await readFile(file));
      return;
    }
    const src = await readFile(file);
    setCropper({ kind: "avatar", src, originalName: file.name });
  };

  const handleBannerPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = null;
    if (!file) return;
    const result = validateImageFile(file);
    if (!result.valid) {
      showToast(result.message, "error");
      return;
    }
    if (isGif(file)) {
      setBannerFile(file);
      setBannerPreview(await readFile(file));
      return;
    }
    const src = await readFile(file);
    setCropper({ kind: "banner", src, originalName: file.name });
  };

  const handleCropComplete = async (blob) => {
    if (!cropper) return;
    const ext = blob.type === "image/gif" ? "gif" : "jpg";
    const named = new File([blob], `${cropper.kind}.${ext}`, { type: blob.type });
    const dataUrl = await readFile(named);
    if (cropper.kind === "avatar") {
      setAvatarFile(named);
      setAvatarPreview(dataUrl);
    } else {
      setBannerFile(named);
      setBannerPreview(dataUrl);
    }
    setCropper(null);
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const handleRollback = () => {
    if (!initialState) return;
    setDisplayName(initialState.displayName);
    setBio(initialState.bio);
    setCountry(initialState.country);
    setAvatarPreview(initialState.avatarPreview);
    setBannerPreview(initialState.bannerPreview);
    setAvatarFile(null);
    setBannerFile(null);
    setAlertPulse(false);
    if (blocker.state === "blocked") blocker.reset();
  };

  const handleSave = async () => {
    if (!username) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("username", username);
      fd.append("name", displayName);
      fd.append("bio", bio);
      fd.append("location", country);
      if (avatarFile) {
        fd.append("profileImage", avatarFile);
      }
      if (bannerFile) {
        fd.append("userbanner", bannerFile);
      }
      if (!avatarPreview) fd.append("removeProfileImage", "true");
      if (!bannerPreview) fd.append("removeUserbanner", "true");

      const res = await updateUserProfile(fd);
      if (res?.success) {
        showToast("Profile updated", "success");
        const updated = res.data?.data || res.data;
        if (updated && setUserLogged) {
          setUserLogged((prev) => ({ ...prev, ...updated }));
        }
        setInitialState({
          displayName,
          bio,
          country,
          avatarPreview,
          bannerPreview,
        });
        setAvatarFile(null);
        setBannerFile(null);
        setAlertPulse(false);
        if (blocker.state === "blocked") blocker.proceed();
      } else {
        showToast(res?.message || "Failed to update profile", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const previewUser = {
    ...(profile || userLogged || {}),
    name: displayName || username || "Your name",
    username,
    bio,
    location: countryName || country,
    userimage: avatarPreview,
    userbanner: bannerPreview,
  };

  return (
    <SettingsTab title="Profile">
      <div className={style.layout}>
        <div className={style.form}>
          <div className={style.section}>
            <span className={style.sectionLabel}>Profile picture</span>
            <div className={style.avatarUploader}>
              <div className={style.avatarPreview}>
                <Image
                  src={avatarPreview}
                  name={displayName || username}
                  size={96}
                  showBadge={false}
                />
              </div>
              <div className={style.uploadActions}>
                <div className={style.uploadButtons}>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<FiUpload />}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    Upload
                  </Button>
                  {avatarPreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<FiTrash2 />}
                      onClick={removeAvatar}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <span className={style.helperText}>PNG, JPG, GIF up to 5MB.</span>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept={IMAGE_ACCEPT_ATTR}
                className={style.fileInput}
                onChange={handleAvatarPick}
              />
            </div>
          </div>

          <div className={style.section}>
            <span className={style.sectionLabel}>Banner</span>
            <div
              className={`${style.bannerUploader} ${bannerPreview ? style.bannerHasImage : ""}`}
              style={bannerPreview ? { backgroundImage: `url(${bannerPreview})` } : undefined}
              onClick={() => bannerInputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              {!bannerPreview && (
                <div className={style.bannerEmpty}>
                  <FiUpload size={20} />
                  <span>Click to upload image or GIF</span>
                </div>
              )}
              {bannerPreview && (
                <>
                  <div className={style.bannerHoverOverlay}>
                    <FiUpload size={22} />
                    <span>Click to change</span>
                  </div>
                  <button
                    type="button"
                    className={style.bannerRemoveButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBanner();
                    }}
                    aria-label="Remove banner"
                    title="Remove banner"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </>
              )}
            </div>
            <span className={style.helperText}>
              Recommended 1080×420. Animated GIFs supported.
            </span>
            <input
              ref={bannerInputRef}
              type="file"
              accept={IMAGE_ACCEPT_ATTR}
              className={style.fileInput}
              onChange={handleBannerPick}
            />
          </div>

          <TextInput
            id="displayName"
            label="Display name"
            placeholder="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={NAME_MAX}
          />

          <TextInput
            id="username"
            label="Username"
            value={username}
            readOnly
            disabled
          />

          <TextArea
            id="bio"
            label="Bio"
            placeholder="Tell others about yourself"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={BIO_MAX}
            showCounter
            rows={6}
            className={style.bioTextarea}
          />

          <div className={style.section}>
            <span className={style.sectionLabel}>Country</span>
            <CountrySelect value={country} onChange={setCountry} styles={style} />
          </div>
        </div>

        <aside className={style.previewWrapper}>
          <div className={style.previewLabel}>Preview</div>
          <UserSidebarCard user={previewUser} staticPreview />
        </aside>
      </div>

      {cropper && (
        <ImageCropper
          imageSrc={cropper.src}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropper(null)}
          outputWidth={cropper.kind === "avatar" ? 512 : 1080}
          outputHeight={cropper.kind === "avatar" ? 512 : 420}
          cropShape={cropper.kind === "avatar" ? "round" : "rect"}
          title={cropper.kind === "avatar" ? "Edit profile picture" : "Edit banner"}
        />
      )}

      {hasUnsavedChanges && (
        <div className={`${style.unsavedBar} ${barEntering ? style.unsavedBarEnter : ""} ${alertPulse ? style.unsavedBarAlert : ""}`}>
          <span className={style.unsavedText}>
            You have unsaved changes!
          </span>
          <div className={style.unsavedActions}>
            <button
              className={style.unsavedRollback}
              onClick={handleRollback}
            >
              Reset
            </button>
            <button
              className={style.unsavedSave}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </SettingsTab>
  );
};

export default Profile;
