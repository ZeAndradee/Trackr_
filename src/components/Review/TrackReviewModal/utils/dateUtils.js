export const formatDateForDisplay = (date) => {
  if (!date) return "";

  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
};

export const calculateCalendarPosition = (buttonRef) => {
  if (!buttonRef || !buttonRef.current) {
    return { top: 0, left: 0 };
  }

  const buttonRect = buttonRef.current.getBoundingClientRect();
  return {
    top: buttonRect.bottom + window.scrollY + 5,
    left: buttonRect.left + window.scrollX,
  };
};
