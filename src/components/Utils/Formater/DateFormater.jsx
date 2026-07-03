export const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", options);
};
