export const SLOVENIAN_LOCALE = 'sl-SI';

export function formatDateForDisplay(date: Date | string): string {
  return new Date(date).toLocaleDateString(SLOVENIAN_LOCALE);
}

export function formatBidDate(dateString: string): string {
  const date = new Date(dateString);
  const time = date.toLocaleTimeString(SLOVENIAN_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = date
    .toLocaleDateString(SLOVENIAN_LOCALE, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    })
    .replace(/\//g, '.');
  return `${time} ${dateStr}`;
}

export function createMidnightUTCDate(dateString: string): Date | null {
  const trimmedDate = dateString.trim();
  if (!trimmedDate) return null;

  const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  if (!regex.test(trimmedDate)) return null;

  const [, day, month, year] = trimmedDate.match(regex)!;

  // Set the UTC time to 23:00:00, since CET is UTC+1
  const date = new Date(`${year}-${month}-${day}T23:00:00Z`);

  if (Number.isNaN(date.getTime())) return null;

  const constructedDay = Number.parseInt(day, 10);
  const constructedMonth = Number.parseInt(month, 10);
  const constructedYear = Number.parseInt(year, 10);

  if (
    date.getUTCDate() !== constructedDay ||
    date.getUTCMonth() + 1 !== constructedMonth ||
    date.getUTCFullYear() !== constructedYear
  ) {
    return null;
  }

  return date;
}
