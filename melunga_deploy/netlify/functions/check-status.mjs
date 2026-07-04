// netlify/functions/check-status.mjs
// Renvoie le statut "paye" pour un device_id donne, en verifiant l'expiration.
// Appelee par l'app au chargement pour savoir si l'appareil a un acces valide,
// plutot que de faire confiance uniquement au localStorage (facilement modifiable).

import { getStore } from '@netlify/blobs';

export default async (req) => {
  const url = new URL(req.url);
  const deviceId = url.searchParams.get('device_id');
  if (!deviceId) {
    return new Response(JSON.stringify({ paid: false, error: 'missing_device_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const store = getStore({ name: 'melunga-access', consistency: 'strong' });
  const record = await store.get(deviceId, { type: 'json' }).catch(() => null);

  const paid = !!(record && record.paid && record.expiry > Date.now());

  return new Response(JSON.stringify({ paid, expiry: record ? record.expiry : null }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
};
