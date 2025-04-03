export const prettifyToHumanReadableDate = (date: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let result: string;

  if (seconds < 60) {
    result = "Just now";
  } else if (minutes < 60) {
    result = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (hours < 24) {
    result = `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (days < 30) {
    result = `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (months < 12) {
    result = `${months} month${months > 1 ? "s" : ""} ago`;
  } else {
    result = `${years} year${years > 1 ? "s" : ""} ago`;
  }

  return result;
};
