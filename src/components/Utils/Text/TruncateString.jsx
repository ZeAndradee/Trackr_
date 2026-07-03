import { parseISO, getYear } from "date-fns";

export const truncateString = (string, maxLength) => {
  if (string?.length > maxLength) {
    return string?.substring(0, maxLength) + "...";
  }
  return string;
};

export const returnYear = (dateString) => {
  try {
    const date = parseISO(dateString);
    return getYear(date);
  } catch (error) {
    return null;
  }
};
