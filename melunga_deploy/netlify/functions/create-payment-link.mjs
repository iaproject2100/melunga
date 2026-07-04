// netlify/functions/create-payment-link.mjs
// Cree un Payment Link Airwallex (page hebergee) pour un device_id et une formule donnes.
// Variables d'environnement requises (Netlify > Site settings > Environment variables) :
//   AIRWALLEX_CLIENT_ID   - Client ID (Airwallex > Developer > API keys)
//   AIRWALLEX_API_KEY     - API key associee
//   AIRWALLEX_ENV         - "demo" (bac a sable) ou "live" (production). Defaut: "demo"
//
// Tarifs fixes selon la zone geographique du visiteur :
//   Zone EUR (UE + EEE + UK, Suisse EXCLUE) : 7,90 EUR/mois ou 42 EUR/an
//   Zone USD (reste du monde, Suisse incluse) : 8,90 USD/mois ou 49 USD/an

const EUR_COUNTRIES = new Set([
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT',
  'LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
  'IS','NO','LI','GB','MC','AD','SM','VA'
]);

function plansFor(countryCode) {
  const isEur = EUR_COUNTRIES.has(countryCode);
  return {
    monthly: { amount: isEur ? 7.90 : 8.90, currency: isEur ? 'EUR' : 'USD', days: 30,  title: 'Melunga · abonnement mensuel' },
    annual:  { amount: isEur ? 42   : 49,   currency: isEur ? 'EUR' : 'USD', days: 365, title: 'Melunga · abonnement annuel' }
  };
}

function baseUrl() {
  return (process.env.AIRWALLEX_ENV === 'live')
    ? 'https://api.airwallex.com'
    : 'https://api-demo.airwallex.com';
}

async function getAccessToken() {
  console.log('[create-payment-link] AIRWALLEX_ENV =', process.env.AIRWALLEX_ENV);
  console.log('[create-payment-link] AIRWALLEX_CLIENT_ID present =', !!process.env.AIRWALLEX_CLIENT_ID);
  console.log('[create-payment-link] AIRWALLEX_API_KEY present =', !!process.env.AIRWALLEX_API_KEY);
  console.log('[create-payment-link] calling auth at', `${baseUrl()}/api/v1/authentication/login`);

  const res = await fetch(`${baseUrl()}/api/v1/authentication/login`, {
    method: 'POST',
    headers: {
      'x-client-id': process.env.AIRWALLEX_CLIENT_ID || '',
      'x-api-key': process.env.AIRWALLEX_API_KEY || '',
      'Content-Type': 'application/json'
    }
  });
  const bodyText = await res.text();
  console.log('[create-payment-link] auth response status =', res.status, 'body =', bodyText);
  if (!res.ok) throw new Error('auth_failed: ' + res.status + ' ' + bodyText);
  const data = JSON.parse(bodyText);
  return data.token;
}

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405 });
  }
  try {
    const body = await req.json();
    const deviceId = (body && body.device_id ? String(body.device_id) : '').slice(0, 128);
    if (!deviceId) {
      console.log('[create-payment-link] missing device_id, body =', JSON.stringify(body));
      return new Response(JSON.stringify({ error: 'missing_device_id' }), { status: 400 });
    }

    const countryCode = (context.geo && context.geo.country && context.geo.country.code) || null;
    const PLANS = plansFor(countryCode);
    const planKey = (body && PLANS[body.plan]) ? body.plan : 'monthly';
    const plan = PLANS[planKey];
    console.log('[create-payment-link] country =', countryCode, 'plan =', planKey, plan);

    const token = await getAccessToken();

    const linkPayload = {
      request_id: `melunga_${deviceId}_${Date.now()}`,
      amount: plan.amount,
      currency: plan.currency,
      title: plan.title,
      reusable: false,
      collectable_shopper_info: { message: false, phone_number: false, reference: false, shipping_address: false },
      metadata: { device_id: deviceId, plan: planKey, access_days: plan.days, product: 'melunga_access', country: countryCode || '' }
    };
    console.log('[create-payment-link] creating payment link with payload =', JSON.stringify(linkPayload));

    const linkRes = await fetch(`${baseUrl()}/api/v1/pa/payment_links/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(linkPayload)
    });

    const linkBodyText = await linkRes.text();
    console.log('[create-payment-link] payment_links/create response status =', linkRes.status, 'body =', linkBodyText);

    if (!linkRes.ok) {
      return new Response(JSON.stringify({ error: 'link_creation_failed', detail: linkBodyText }), { status: 502 });
    }

    const linkData = JSON.parse(linkBodyText);
    return new Response(JSON.stringify({ url: linkData.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('[create-payment-link] EXCEPTION:', err);
    return new Response(JSON.stringify({ error: 'server_error', detail: String(err) }), { status: 500 });
  }
};
