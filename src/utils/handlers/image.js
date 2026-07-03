export const setImageResolution = (url, size = 4000) => {
  if (!url || typeof url !== "string") return url;
  const dim = typeof size === "number" ? `${size}x${size}` : size;
  return url.replace(/\d+x\d+([a-zA-Z]*\.[a-zA-Z]+)$/, `${dim}$1`);
};
