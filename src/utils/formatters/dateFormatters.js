export const formatDate = (dateString) => {
  if (!dateString) {
    console.error("No date string provided");
    return "No date";
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid date format:", dateString);
      return "Invalid date";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Error";
  }
};

export const formatMonthDay = (dateString) => {
  if (!dateString) return "No date";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return "Error";
  }
};

export const getTrackDate = (track) => {
  if (track?.logDate) {
    return formatDate(track.logDate);
  }

  if (track?.selectedDate) return formatDate(track.selectedDate);
  if (track?.createdAt) return formatDate(track.createdAt);
  if (track?.createdAtDate) return formatDate(track.createdAtDate);

  return "No date";
};

export const getTrackMonthDay = (track) => {
  if (track?.logDate) return formatMonthDay(track.logDate);
  if (track?.selectedDate) return formatMonthDay(track.selectedDate);
  if (track?.createdAt) return formatMonthDay(track.createdAt);
  if (track?.createdAtDate) return formatMonthDay(track.createdAtDate);

  return "No date";
};

export const getRelativeTime = (dateString) => {
  if (!dateString) return "No date";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    } else if (diffInDays < 30) {
      return `${diffInWeeks} week${diffInWeeks !== 1 ? "s" : ""} ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
    } else {
      return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
    }
  } catch (error) {
    console.error("Relative time formatting error:", error);
    return "Unknown time";
  }
};

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const getDiffDays = (dateString) => {
  const target = new Date(dateString);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((todayStart.getTime() - targetStart.getTime()) / 86400000);
};

export const getTimelineBucket = (dateString) => {
  const diffDays = getDiffDays(dateString);
  if (diffDays === 0) return { key: "today", label: "Today" };
  if (diffDays === 1) return { key: "yesterday", label: "Yesterday" };
  if (diffDays < 7) return { key: "thisweek", label: "This week" };
  if (diffDays < 14) return { key: "lastweek", label: "Last week" };
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return { key: `w${weeks}`, label: `${weeks} weeks ago` };
  }
  if (diffDays < 60) return { key: "lastmonth", label: "Last month" };
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return { key: `m${months}`, label: `${months} months ago` };
  }
  if (diffDays < 730) return { key: "lastyear", label: "Last year" };
  const years = Math.floor(diffDays / 365);
  return { key: `y${years}`, label: `${years} years ago` };
};

export const getDayKey = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

export const formatDayParts = (dateString) => {
  const date = new Date(dateString);
  const weekdaysFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return {
    weekday: weekdaysFull[date.getDay()],
    day: `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`,
  };
};

export const getRelativeTimeCompact = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} s`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} m`;
    } else if (diffInHours < 24) {
      return `${diffInHours} h`;
    } else if (diffInDays < 7) {
      return `${diffInDays} d`;
    } else if (diffInDays < 30) {
      return `${diffInWeeks} w`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} mon`;
    } else {
      return `${diffInYears} y`;
    }
  } catch (error) {
    console.error("Relative time formatting error:", error);
    return "";
  }
};
