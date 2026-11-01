export const ALLOWED_ORIGIN = 'https://wu-hjj.github.io';
export const DATA_REGION = 'eu-central-1';

export function parseDateUTC(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(value + 'T00:00:00Z');
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value ? d : null;
}

export function amsterdamDay(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const part = type => parts.find(x => x.type === type)?.value;
  return [part('year'), part('month'), part('day')].join('-');
}

export function sanitizePlace(input, limit = 75) {
  const value = String(input ?? 'Unknown').trim().replace(/[\r\n\t]/g, ' ').replace(/[\x00-\x1f\x7f]/g, '');
  return value.slice(0, limit) || 'Unknown';
}

export function allowedOrigin(origin) { return origin === ALLOWED_ORIGIN; }
export function corsHeaders() {
  return {'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Vary': 'Origin', 'Cache-Control': 'no-store'};
}

export function recentDays(from, to) {
  const a = parseDateUTC(from), b = parseDateUTC(to);
  if (!a || !b) return null;
  const count = Math.round((b - a) / 86400000);
  if (count < 0 || count > 30) return null;
  return Array.from({length: count + 1}, (_,i) => new Date(a.getTime() + i * 86400000).toISOString().slice(0, 10));
}
