import { timingSafeEqual } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { DATA_REGION, amsterdamDay, recentDays, sanitizePlace } from './_common.mjs';

function sameSecret(value, secret) {
  if (!value || !secret) return false;
  const a = Buffer.from(value), b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req) {
  if (req.method !== 'GET') return new Response('Method not allowed', {status: 405});
  const secret = Netlify.env.get('REPORT_TOKEN');
  if (!sameSecret(req.headers.get('x-report-token'), secret)) {
    return new Response('Unauthorized', {status: 401, headers: {'Cache-Control': 'no-store'}});
  }
  const url = new URL(req.url);
  const to = url.searchParams.get('to') || amsterdamDay();
  const d = new Date(to + 'T00:00:00Z');
  const defaultFrom = Number.isFinite(+d) ? new Date(+d - 6 * 86400000).toISOString().slice(0, 10) : '';
  const from = url.searchParams.get('from') || defaultFrom;
  const days = recentDays(from, to);
  if (!days) return new Response('Date range must be 1-31 valid days, YYYY-MM-DD', {status: 400});
  try {
    const store = getStore({name: 'city-pageviews', region: DATA_REGION});
    const counts = new Map();
    let total = 0;
    for (const day of days) {
      const {blobs} = await store.list({prefix: day + '/'});
      for (const blob of blobs) {
        const entry = await store.get(blob.key, {type: 'json'});
        if (!entry) continue;
        const country = sanitizePlace(entry.country, 2).toUpperCase();
        const city = sanitizePlace(entry.city);
        const key = JSON.stringify([day, country, city]);
        counts.set(key, (counts.get(key) || 0) + 1);
        total += 1;
      }
    }
    const rows = [...counts.entries()].map(([key, views]) => {
      const [day, country, city] = JSON.parse(key);
      return {day, country, city, views};
    }).sort((a, b) => b.views - a.views || a.day.localeCompare(b.day) ||
      a.country.localeCompare(b.country) || a.city.localeCompare(b.city));
    return Response.json({site: 'wu-hjj.github.io', from, to, metric: 'pageviews', total, rows},
      {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {
    console.error('Unable to fetch report:', error.message);
    return new Response('Unavailable', {status: 503, headers: {'Cache-Control': 'no-store'}});
  }
}
