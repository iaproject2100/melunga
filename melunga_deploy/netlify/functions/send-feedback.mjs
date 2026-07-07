// netlify/functions/send-feedback.mjs
// Recoit le feedback du formulaire in-app et l'envoie par email
// a contact@melunga.com via Brevo.
// Recoit du front : { message, email (facultatif), lang, nat, hp (honeypot) }
// Variable d'environnement requise : BREVO_API_KEY

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'method_not_allowed' }), { status: 405 });
  }
  try {
    let body = {};
    try { body = await req.json(); } catch (e) { body = {}; }

    // Honeypot anti-spam : un champ cache que seuls les robots remplissent.
    if (body && body.hp) {
      console.log('[send-feedback] honeypot rempli, spam ignore');
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    const message = (body && body.message ? String(body.message) : '').trim().slice(0, 4000);
    const email = (body && body.email ? String(body.email) : '').trim().toLowerCase().slice(0, 254);
    const lang = (body && body.lang ? String(body.lang) : '?').slice(0, 8);
    const nat = (body && body.nat ? String(body.nat) : '?').slice(0, 8);

    if (!message || message.length < 3) {
      return new Response(JSON.stringify({ success: false, error: 'empty_message' }), { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error('[send-feedback] BREVO_API_KEY absente');
      return new Response(JSON.stringify({ success: false, error: 'server_error' }), { status: 500 });
    }

    const countryCode = (context.geo && context.geo.country && context.geo.country.code) || '?';
    const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Melunga Feedback', email: 'contact@melunga.com' },
        to: [{ email: 'contact@melunga.com' }],
        replyTo: email && email.indexOf('@') > 0 ? { email } : undefined,
        subject: '📝 Feedback Melunga (' + nat + ' → ' + lang + ', ' + countryCode + ')',
        htmlContent:
          '<h3>Nouveau feedback utilisateur</h3>' +
          '<p><b>Message :</b><br>' + esc(message) + '</p>' +
          '<p><b>Email :</b> ' + (email || 'non fourni') +
          '<br><b>Langue apprise :</b> ' + lang +
          '<br><b>Langue native :</b> ' + nat +
          '<br><b>Pays :</b> ' + countryCode +
          '<br><b>Date :</b> ' + new Date().toISOString() + '</p>'
      })
    });

    const resText = await res.text();
    console.log('[send-feedback] Brevo status =', res.status, 'body =', resText.slice(0, 300));

    if (!res.ok) {
      return new Response(JSON.stringify({ success: false, error: 'send_failed' }), { status: 502 });
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('[send-feedback] EXCEPTION:', err);
    return new Response(JSON.stringify({ success: false, error: 'server_error' }), { status: 500 });
  }
};
