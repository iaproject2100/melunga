import { getStore } from '@netlify/blobs';

/*
 * FONCTION JETABLE — À SUPPRIMER APRÈS USAGE.
 *
 * Crée (ou remet à zéro) le compte démo demo@melunga.com dans le store
 * Netlify Blobs "melunga-access". Protégée par un token secret passé en
 * query string : sans le bon token, elle ne fait rien.
 *
 * Usage : ouvrir une seule fois dans le navigateur
 *   https://melunga.app/.netlify/functions/seed-demo?token=Melunga-seed-9271
 * puis SUPPRIMER ce fichier du repo et recommiter.
 */

const SEED_TOKEN = 'Melunga-seed-9271';

const DEMO_ACCOUNT = {
  email: 'demo@melunga.com',
  passwordHash: '327f30f00aadb84fe7c90a06166bcc13da8a8e02ec7c1678b44fd80e232cd589',
  salt: '013cc10de49be4391f762137b5a70f9c',
  paid: true,
  expiry: 4102444800000,
  plan: 'demo',
  deviceLimit: 100,
  devices: {},
  created: Date.now(),
  updated: Date.now()
};

export default async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get('token') !== SEED_TOKEN) {
    return new Response('forbidden', { status: 403 });
  }

  try {
    const store = getStore({ name: 'melunga-access', consistency: 'strong' });
    await store.setJSON('email:demo@melunga.com', {
      ...DEMO_ACCOUNT,
      created: Date.now(),
      updated: Date.now()
    });
    return new Response(JSON.stringify({
      ok: true,
      message: 'Compte démo créé. Supprimez maintenant seed-demo.mjs du repo.'
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};
