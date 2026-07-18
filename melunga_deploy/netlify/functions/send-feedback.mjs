// netlify/functions/send-feedback.mjs
// Reçoit les avis du formulaire 💬 et les envoie à contact@melunga.com via l'API Brevo.
// Prérequis : variable d'environnement BREVO_API_KEY dans Netlify (Site settings → Environment variables).

import { jsonResponse, preflight } from './cors.mjs';

export default async (req) => {
  const preflightResponse = preflight(req);
  if (preflightResponse) return preflightResponse;
  const json = (obj, status = 200) => jsonResponse(req, obj, status);

  if (req.method !== 'POST') return json({ success: false, error: 'method' }, 405);

  let body;
  try { body = await req.json(); }
  catch { return json({ success: false, error: 'badjson' }, 400); }

  const message = (body.message || '').toString().trim().slice(0, 4000);
  const email   = (body.email || '').toString().trim().slice(0, 200);
  const hp      = (body.hp || '').toString();
  const lang    = (body.lang || '').toString().slice(0, 8);
  const nat     = (body.nat || '').toString().slice(0, 8);

  // Honeypot anti-bot : champ caché rempli = robot → on répond "ok" sans rien envoyer
  if (hp) return json({ success: true });

  if (message.length < 3) return json({ success: false, error: 'empty' }, 400);

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('send-feedback: BREVO_API_KEY manquante');
    return json({ success: false, error: 'config' }, 500);
  }

  const payload = {
    sender: { name: 'Melunga Avis', email: 'contact@melunga.com' },
    to: [{ email: 'contact@melunga.com', name: 'Melunga' }],
    replyTo: email && /@/.test(email)
      ? { email, name: 'Utilisateur Melunga' }
      : { email: 'contact@melunga.com', name: 'Melunga' },
    subject: '💬 Avis Melunga (' + (nat || '?') + ' → ' + (lang || '?') + ')',
    textContent:
      'Message :\n' + message +
      '\n\n---\nEmail indiqué : ' + (email || '(aucun)') +
      '\nLangue apprise : ' + (lang || '?') +
      '\nLangue native : ' + (nat || '?') +
      '\nDate : ' + new Date().toISOString()
  };

  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!r.ok) {
      const errTxt = await r.text();
      console.error('send-feedback: Brevo ' + r.status + ' → ' + errTxt.slice(0, 300));
      return json({ success: false, error: 'brevo' }, 502);
    }
    return json({ success: true });
  } catch (e) {
    console.error('send-feedback: exception → ' + (e && e.message));
    return json({ success: false, error: 'network' }, 502);
  }
};
