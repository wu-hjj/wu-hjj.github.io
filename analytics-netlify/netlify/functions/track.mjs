import { randomUUID } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { DATA_REGION, amsterdamDay, corsHeaders, sanitizePlace, allowedOrigin } from './_common.mjs';

export default async function handler(req, context) {
  const cors = corsHeaders();
  if (!allowedOrigin(req.headers.get('origin'))) return new Response('Forbidden', {status: 403});
  if (req.method === 'OPTIONS') {
    return new Response(null, {status: 204, headers: {...cors,
      'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type'}});
  }
  if (req.method !== 'POST') return new Response('Method not allowed', {status: 405, headers: cors});
  if (req.headers.get('sec-gpc') === '1' || req.headers.get('dnt') === '1') {
    return new Response(null, {status: 204, headers: cors});
  }
  if (/bot|crawler|spider|headless|lighthouse|googlebot|bingbot/i.test(req.headers.get('user-agent') || '')) {
    return new Response(null, {status: 204, headers: cors});
  }
  const day = amsterdamDay();
  const country = sanitizePlace(context.geo?.country?.code, 2).toUpperCase();
  const city = sanitizePlace(context.geo?.city);
  try {
    const store = getStore({name: 'city-pageviews', region: DATA_REGION});
    await store.setJSON(day + '/' + randomUUID(), {country, city});
    return new Response(null, {status: 204, headers: cors});
  } catch (error) {
    console.error('Unable to record page view:', error.message);
    return new Response('Unavailable', {status: 503, headers: cors});
  }
}
