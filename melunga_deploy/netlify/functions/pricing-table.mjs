// netlify/functions/pricing-table.mjs
// Source unique de la grille tarifaire cote serveur : utilisee par create-payment-link.mjs
// (facturation Airwallex) et get-pricing.mjs (prix affiches dans app.html).
//
// Chaque grand marche paie dans sa devise, le reste du monde en USD.
// Cette grille DOIT rester identique a currencyByCountry / priceMarkets dans index.html
// (une verification automatisee compare les deux).

export const CURRENCY_BY_COUNTRY = Object.freeze({
  // Zone euro et Union europeenne (+ Islande, Norvege, Monaco)
  AT: 'EUR', BE: 'EUR', BG: 'EUR', HR: 'EUR', CY: 'EUR', CZ: 'EUR', DK: 'EUR', EE: 'EUR', FI: 'EUR', FR: 'EUR',
  DE: 'EUR', GR: 'EUR', HU: 'EUR', IE: 'EUR', IT: 'EUR', LV: 'EUR', LT: 'EUR', LU: 'EUR', MT: 'EUR', NL: 'EUR',
  PL: 'EUR', PT: 'EUR', RO: 'EUR', SK: 'EUR', SI: 'EUR', ES: 'EUR', SE: 'EUR', IS: 'EUR', NO: 'EUR', MC: 'EUR',
  CH: 'CHF', LI: 'CHF',
  GB: 'GBP',
  CN: 'CNY',
  HK: 'HKD',
  JP: 'JPY',
  KR: 'KRW',
  SG: 'SGD',
  CA: 'CAD',
  AU: 'AUD'
});

// monthly / annual : montants exacts factures. monthlyDisplay / annualDisplay : libelles
// affiches (identiques a index.html).
export const PLANS_BY_CURRENCY = Object.freeze({
  EUR: { symbol: '€',   monthly: 7.90,  annual: 42,    monthlyDisplay: '7,90 €',    annualDisplay: '42 €',
         titles: ['Melunga · Abonnement mensuel', 'Melunga · Abonnement annuel'] },
  CHF: { symbol: 'CHF', monthly: 7.90,  annual: 42,    monthlyDisplay: '7,90 CHF',  annualDisplay: '42 CHF',
         titles: ['Melunga · Abonnement mensuel', 'Melunga · Abonnement annuel'] },
  GBP: { symbol: '£',   monthly: 6.90,  annual: 36,    monthlyDisplay: '6,90 £',    annualDisplay: '36 £',
         titles: ['Melunga · Monthly subscription', 'Melunga · Annual subscription'] },
  CNY: { symbol: 'CNY', monthly: 59,    annual: 299,   monthlyDisplay: '59 CNY',    annualDisplay: '299 CNY',
         titles: ['Melunga · 月度订阅', 'Melunga · 年度订阅'] },
  HKD: { symbol: 'HK$', monthly: 68,    annual: 349,   monthlyDisplay: '68 HK$',    annualDisplay: '349 HK$',
         titles: ['Melunga · Monthly subscription', 'Melunga · Annual subscription'] },
  JPY: { symbol: '¥',   monthly: 1290,  annual: 6900,  monthlyDisplay: '1 290 ¥',   annualDisplay: '6 900 ¥',
         titles: ['Melunga · 月額プラン', 'Melunga · 年額プラン'] },
  KRW: { symbol: '₩',   monthly: 11900, annual: 59000, monthlyDisplay: '11 900 ₩',  annualDisplay: '59 000 ₩',
         titles: ['Melunga · 월간 이용권', 'Melunga · 연간 이용권'] },
  SGD: { symbol: 'S$',  monthly: 11.90, annual: 59,    monthlyDisplay: '11,90 S$',  annualDisplay: '59 S$',
         titles: ['Melunga · Monthly subscription', 'Melunga · Annual subscription'] },
  CAD: { symbol: 'C$',  monthly: 11.90, annual: 59,    monthlyDisplay: '11,90 C$',  annualDisplay: '59 C$',
         titles: ['Melunga · Monthly subscription', 'Melunga · Annual subscription'] },
  AUD: { symbol: 'A$',  monthly: 12.90, annual: 69,    monthlyDisplay: '12,90 A$',  annualDisplay: '69 A$',
         titles: ['Melunga · Monthly subscription', 'Melunga · Annual subscription'] },
  USD: { symbol: 'US$', monthly: 8.90,  annual: 49,    monthlyDisplay: '8,90 US$',  annualDisplay: '49 US$',
         titles: ['Melunga · Monthly subscription', 'Melunga · Annual subscription'] }
});

export function currencyFor(countryCode) {
  return CURRENCY_BY_COUNTRY[String(countryCode || '').toUpperCase()] || 'USD';
}

export function plansForCurrency(currency) {
  const code = PLANS_BY_CURRENCY[currency] ? currency : 'USD';
  const p = PLANS_BY_CURRENCY[code];
  return {
    monthly: { amount: p.monthly, currency: code, days: 30,  title: p.titles[0] },
    annual:  { amount: p.annual,  currency: code, days: 365, title: p.titles[1] }
  };
}

export function plansFor(countryCode) {
  return plansForCurrency(currencyFor(countryCode));
}

// Objet renvoye par get-pricing (forme attendue par app.html : code, symbol, monthly, annual,
// monthlyDisplay, annualDisplay).
export function pricingForCountry(countryCode) {
  const code = currencyFor(countryCode);
  const p = PLANS_BY_CURRENCY[code];
  return {
    code,
    symbol: p.symbol,
    monthly: p.monthly,
    annual: p.annual,
    monthlyDisplay: p.monthlyDisplay,
    annualDisplay: p.annualDisplay
  };
}

// Montant attendu pour un plan et une devise donnes (controle du webhook).
export function expectedAmount(planKey, currency) {
  const plans = plansForCurrency(currency);
  const plan = plans[planKey === 'annual' ? 'annual' : 'monthly'];
  return plan ? plan.amount : null;
}
