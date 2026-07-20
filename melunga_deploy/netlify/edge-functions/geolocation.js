// netlify/edge-functions/geolocation.js
// Renvoie le pays du visiteur d'apres son adresse IP (geolocalisation Netlify Edge).
// La page d'accueil appelle /api/geolocation pour afficher la bonne devise
// (et cela reflete un VPN, contrairement a la detection par fuseau horaire).
export default async (request, context) => {
  const geo = (context && context.geo) || {};
  const country = (geo.country && geo.country.code) || "";
  return new Response(JSON.stringify({ country }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
};

export const config = { path: "/api/geolocation" };
