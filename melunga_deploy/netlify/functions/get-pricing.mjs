// netlify/functions/get-pricing.mjs
// Devise et tarifs a afficher dans app.html selon le pays du visiteur (geolocalisation IP
// native Netlify via context.geo). La grille vient de pricing-table.mjs, partagee avec
// create-payment-link.mjs : ce qui est affiche est exactement ce qui est facture.

import { jsonResponse, preflight } from './cors.mjs';
import { pricingForCountry } from './pricing-table.mjs';

export { pricingForCountry };

export default async (req, context) => {
  const preflightResponse = preflight(req);
  if (preflightResponse) return preflightResponse;

  const countryCode = (context.geo && context.geo.country && context.geo.country.code) || null;
  const pricing = pricingForCountry(countryCode);
  return jsonResponse(req, { country: countryCode, ...pricing });
};
