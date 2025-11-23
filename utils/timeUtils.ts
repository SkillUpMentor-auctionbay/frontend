export function formatTimeLeft(endTime: string): string {
  const endTimeDate = new Date(endTime).getTime();
  const now = new Date().getTime();
  const diff = endTimeDate - now;

  if (diff <= 0) return "Ended";

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days > 1) {
    return `${days}d`;
  }

  const hours = Math.ceil(diff / (1000 * 60 * 60));
  if (hours > 1) {
    return `${hours}h`;
  }

  const minutes = Math.ceil(diff / (1000 * 60));
  return `${Math.max(1, minutes)}m`;
}


export function isTimeUrgent(endTime: string): boolean {
  const endTimeDate = new Date(endTime).getTime();
  const now = new Date().getTime();
  const diff = endTimeDate - now;

  return diff <= 0 || diff < (1000 * 60 * 60 * 24);
}


export function getTimeRemaining(endTime: string): number {
  const endTimeDate = new Date(endTime).getTime();
  const now = new Date().getTime();
  return Math.max(0, endTimeDate - now);
}