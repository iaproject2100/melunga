// netlify/functions/get-pricing.mjs
// Determine la devise et les tarifs a afficher selon le pays du visiteur (geolocalisation
// IP native fournie par Netlify via context.geo, aucun service tiers necessaire).
//
// Zone EUR (7,90 EUR/mois ou 42 EUR/an) : Union europeenne + EEE + Royaume-Uni + microetats.
// Zone USD (8,90 USD/mois ou 49 USD/an) : reste du monde, Suisse INCLUSE (la Suisse n'est
// pas dans l'UE et n'utilise pas l'euro, elle est donc traitee comme "hors Europe" ici).

const EUR_COUNTRIES = new Set([
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT',
  'LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
  'IS','NO','LI','GB','MC','AD','SM','VA'
  // CH (Suisse) volontairement absente : traitee comme hors zone EUR
]);

export const PRICING = {
  EUR: { symbol: '€', code: 'EUR', monthly: 7.90, annual: 42,  monthlyDisplay: '7,90 €', annualDisplay: '42 €' },
  USD: { symbol: '$', code: 'USD', monthly: 8.90, annual: 49,  monthlyDisplay: '8.90 $', annualDisplay: '49 $' }
};

export function pricingForCountry(countryCode) {
  return EUR_COUNTRIES.has(countryCode) ? PRICING.EUR : PRICING.USD;
}

export default async (req, context) => {
  const countryCode = (context.geo && context.geo.country && context.geo.country.code) || null;
  const pricing = pricingForCountry(countryCode);
  return new Response(JSON.stringify({ country: countryCode, ...pricing }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
};
