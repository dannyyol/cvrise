export type DateStyle = 'year' | 'month-year' | 'month-year-numeric' | 'full' | 'full-numeric';

const DEFAULT_LOCALE = 'en-US';

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;

  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const isoMonth = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (isoMonth) {
    const year = Number(isoMonth[1]);
    const monthIndex = Number(isoMonth[2]) - 1;
    if (Number.isFinite(year) && Number.isFinite(monthIndex)) {
      return new Date(Date.UTC(year, monthIndex, 1, 12));
    }
  }

  const isoDay = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDay) {
    const year = Number(isoDay[1]);
    const monthIndex = Number(isoDay[2]) - 1;
    const day = Number(isoDay[3]);
    if (Number.isFinite(year) && Number.isFinite(monthIndex) && Number.isFinite(day)) {
      return new Date(Date.UTC(year, monthIndex, day, 12));
    }
  }

  const yearOnly = trimmed.match(/^(\d{4})$/);
  if (yearOnly) {
    const year = Number(yearOnly[1]);
    if (Number.isFinite(year)) {
      return new Date(Date.UTC(year, 0, 1, 12));
    }
  }

  const fallback = new Date(trimmed);
  if (Number.isNaN(fallback.getTime())) return null;
  return fallback;
};

const getFormatterOptions = (style: DateStyle): Intl.DateTimeFormatOptions => {
  if (style === 'year') return { year: 'numeric' };
  if (style === 'month-year-numeric') return { year: 'numeric', month: '2-digit' };
  if (style === 'full-numeric') return { year: 'numeric', month: '2-digit', day: '2-digit' };
  if (style === 'full') return { year: 'numeric', month: 'long', day: 'numeric' };
  return { year: 'numeric', month: 'short' };
};

export const formatDate = (value?: string | null, locale?: string, style: DateStyle = 'month-year'): string => {
  if (!value) return '';
  const d = parseDate(value);
  if (!d) return String(value);
  const resolvedLocale = locale || DEFAULT_LOCALE;
  return new Intl.DateTimeFormat(resolvedLocale, getFormatterOptions(style)).format(d);
};

export const formatDateRange = (
  start?: string | null,
  end?: string | null,
  locale?: string,
  opts?: { current?: boolean; style?: DateStyle; presentLabel?: string }
): string => {
  const startLabel = formatDate(start, locale, opts?.style ?? 'month-year');
  const endLabel = opts?.current ? (opts?.presentLabel ?? 'Present') : formatDate(end, locale, opts?.style ?? 'month-year');
  return [startLabel, endLabel].filter(Boolean).join(' \u2014 ');
};

export const formatToday = (locale?: string, style: DateStyle = 'full'): string => {
  const resolvedLocale = locale || DEFAULT_LOCALE;
  return new Intl.DateTimeFormat(resolvedLocale, getFormatterOptions(style)).format(new Date());
};
