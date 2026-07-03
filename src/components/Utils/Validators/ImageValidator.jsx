export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const IMAGE_ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

export const IMAGE_ACCEPT_ATTR = IMAGE_ACCEPTED_TYPES.join(",");

export const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

export const isGif = (file) => file?.type === "image/gif";

export const validateImageFile = (file, options = {}) => {
  const {
    maxBytes = IMAGE_MAX_BYTES,
    acceptedTypes = IMAGE_ACCEPTED_TYPES,
    required = true,
  } = options;

  if (!file) {
    return required
      ? { valid: false, message: "No file provided." }
      : { valid: true };
  }

  if (!acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      message: "Unsupported file type. Use PNG, JPG, WEBP or GIF.",
    };
  }

  if (file.size > maxBytes) {
    return {
      valid: false,
      message: `File too large (${formatBytes(file.size)}). Max ${formatBytes(maxBytes)}.`,
    };
  }

  return { valid: true };
};
