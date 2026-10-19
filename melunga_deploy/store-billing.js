(function () {
  'use strict';

  var PRODUCT_ID = 'melunga_premium';
  var SESSION_KEY = 'ox_session';
  var prices = null;

  function plugin() {
    return window.Capacitor
      && window.Capacitor.Plugins
      && window.Capacitor.Plugins.MelungaBilling;
  }

  function isNativeStore() {
    try {
      return !!plugin() && window.Capacitor.isNativePlatform();
    } catch (_error) {
      return false;
    }
  }

  function feedback(message) {
    var element = document.getElementById('pwFree');
    if (element) element.textContent = message;
  }

  function paidPhase(offer) {
    var phases = offer && offer.pricingPhases ? offer.pricingPhases : [];
    for (var i = phases.length - 1; i >= 0; i -= 1) {
      if (Number(phases[i].priceAmountMicros) > 0) return phases[i];
    }
    return phases.length ? phases[phases.length - 1] : null;
  }

  function hasFreeTrial(offer) {
    return !!(offer && offer.pricingPhases || []).find(function (phase) {
      return Number(phase.priceAmountMicros) === 0;
    });
  }

  function offerFor(basePlanId) {
    var product = prices && prices.products && prices.products[0];
    if (!product || !product.offers) return null;
    var matches = product.offers.filter(function (offer) {
      return offer.basePlanId === basePlanId;
    });
    return matches.find(hasFreeTrial) || matches[0] || null;
  }

  function periodLabel(basePlanId) {
    var locale = (document.documentElement.lang || 'fr').slice(0, 2);
    var labels = {
      fr: { monthly: 'mois', annual: 'an', trial: '7 jours gratuits, puis ' },
      en: { monthly: 'month', annual: 'year', trial: '7 days free, then ' },
      es: { monthly: 'mes', annual: 'año', trial: '7 días gratis, después ' },
      zh: { monthly: '月', annual: '年', trial: '免费 7 天，之后 ' },
      it: { monthly: 'mese', annual: 'anno', trial: '7 giorni gratis, poi ' },
      ja: { monthly: '月', annual: '年', trial: '7日間無料、その後 ' },
      ko: { monthly: '월', annual: '년', trial: '7일 무료, 이후 ' }
    };
    return (labels[locale] || labels.fr)[basePlanId];
  }

  function monthlyEquivalent(phase) {
    var micros = Number(phase && phase.priceAmountMicros);
    var currency = phase && phase.currencyCode;
    if (!micros || !currency) return '';
    var locale = (document.documentElement.lang || 'fr').slice(0, 2);
    var localeTags = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', zh: 'zh-CN', it: 'it-IT', ja: 'ja-JP', ko: 'ko-KR' };
    try {
      return new Intl.NumberFormat(localeTags[locale] || 'fr-FR', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2
      }).format(micros / 12000000);
    } catch (_error) {
      return '';
    }
  }

  function applyStorePrices() {
    ['monthly', 'annual'].forEach(function (basePlanId) {
      var offer = offerFor(basePlanId);
      var phase = paidPhase(offer);
      if (!phase) return;
      var suffix = periodLabel(basePlanId);
      var text = phase.formattedPrice + ' / ' + suffix;
      if (basePlanId === 'annual' && hasFreeTrial(offer)) {
        text = periodLabel('trial') + text;
      }

      var onboarding = document.querySelector(basePlanId === 'annual'
        ? '[data-yearly-plan-price]'
        : '[data-monthly-plan-price]');
      if (onboarding) onboarding.textContent = text;

      var paywall = document.getElementById(basePlanId === 'annual'
        ? 'pwAnnualPrice'
        : 'pwMonthlyPrice');
      if (paywall) paywall.textContent = text;
    });

    var monthlyPhase = paidPhase(offerFor('monthly'));
    var annualOffer = offerFor('annual');
    var annualPhase = paidPhase(annualOffer);
    if (monthlyPhase && annualPhase) {
      if (typeof currentPriceMarket !== 'undefined') {
        currentPriceMarket = {
          label: 'Google Play · ' + (annualPhase.currencyCode || ''),
          monthly: monthlyPhase.formattedPrice,
          yearly: annualPhase.formattedPrice,
          yearlyMonthly: monthlyEquivalent(annualPhase)
        };
        if (typeof renderPremiumOffer === 'function') renderPremiumOffer();
      }
      var locale = (document.documentElement.lang || 'fr').slice(0, 2);
      var summaries = {
        fr: '7 jours Premium offerts · puis {annual} / an ou {monthly} / mois',
        en: '7 days of Premium free · then {annual}/year or {monthly}/month',
        es: '7 días Premium gratis · después {annual}/año o {monthly}/mes',
        zh: 'Premium 免费体验 7 天 · 之后每年 {annual} 或每月 {monthly}',
        it: '7 giorni Premium gratis · poi {annual}/anno o {monthly}/mese',
        ja: 'Premiumを7日間無料体験 · その後は年額{annual}または月額{monthly}',
        ko: 'Premium 7일 무료 · 이후 연 {annual} 또는 월 {monthly}'
      };
      var summary = (summaries[locale] || summaries.fr)
        .replace('{annual}', annualPhase.formattedPrice)
        .replace('{monthly}', monthlyPhase.formattedPrice);
      if (!hasFreeTrial(annualOffer)) {
        summary = annualPhase.formattedPrice + ' / ' + periodLabel('annual')
          + ' · ' + monthlyPhase.formattedPrice + ' / ' + periodLabel('monthly');
      }
      var welcomePrice = document.querySelector('[data-welcome-i18n="price"]');
      if (welcomePrice) welcomePrice.textContent = summary;
      var zone = document.querySelector('[data-price-zone]');
      if (zone) zone.textContent = 'Google Play · ' + (annualPhase.currencyCode || '');
    }
  }

  async function loadProducts() {
    if (!isNativeStore()) return null;
    try {
      prices = await plugin().getProducts();
      window.MELUNGA_STORE_PRICES = prices;
      if (!prices || !prices.products || !prices.products.length) {
        var locale = (document.documentElement.lang || 'fr').slice(0, 2);
        var unavailable = {
          fr: 'Prix Google Play en cours de configuration',
          en: 'Google Play price being configured',
          es: 'Precio de Google Play en configuración',
          zh: 'Google Play 价格配置中',
          it: 'Prezzo Google Play in configurazione',
          ja: 'Google Play価格を設定中',
          ko: 'Google Play 가격 설정 중'
        };
        document.querySelectorAll('[data-monthly-plan-price],[data-yearly-plan-price]').forEach(function (element) {
          element.textContent = unavailable[locale] || unavailable.fr;
        });
        return prices;
      }
      applyStorePrices();
      return prices;
    } catch (error) {
      feedback('Les abonnements Google Play sont momentanément indisponibles.');
      throw error;
    }
  }

  function accountFields() {
    var emailElement = document.getElementById('pwEmail');
    var passwordElement = document.getElementById('pwPassword');
    var confirmationElement = document.getElementById('pwPassword2');
    return {
      email: (emailElement ? emailElement.value : '').trim().toLowerCase(),
      password: passwordElement ? passwordElement.value : '',
      confirmation: confirmationElement ? confirmationElement.value : ''
    };
  }

  function setPurchaseButtonsDisabled(disabled) {
    ['pwMonthly', 'pwAnnual'].forEach(function (id) {
      var button = document.getElementById(id);
      if (button) button.disabled = disabled;
    });
  }

  async function verifyPurchase(purchase, plan, account, restore) {
    var response = await fetch('/.netlify/functions/verify-google-play-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        package_name: 'com.melunga.app',
        product_id: PRODUCT_ID,
        base_plan_id: plan || '',
        purchase_token: purchase.purchaseToken,
        device_id: typeof getDeviceId === 'function' ? getDeviceId() : '',
        device_type: 'mobile',
        device_label: /Android/i.test(navigator.userAgent) ? 'Téléphone Android' : 'Application mobile',
        email: account && account.email || '',
        password: account && account.password || '',
        restore: !!restore
      })
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok || !data.success) {
      var error = new Error(data.error || 'purchase_verification_failed');
      error.code = data.error;
      throw error;
    }
    if (data.session_token) localStorage.setItem(SESSION_KEY, data.session_token);
    if (data.expiry) localStorage.setItem('ox_store_expiry', String(data.expiry));
    localStorage.setItem('ox_paid', '1');
    return data;
  }

  function unlockApplication() {
    try {
      window.isPaid = true;
      var paywall = document.getElementById('paywall');
      if (paywall) paywall.style.display = 'none';
      if (typeof window.buildLevels === 'function') window.buildLevels();
    } catch (_error) {}
  }

  async function purchase(plan) {
    var account = accountFields();
    if (!account.email || account.email.indexOf('@') < 0) {
      feedback(typeof T === 'function' ? T('emailRequired') : 'Adresse e-mail requise');
      return;
    }
    if (!account.password || account.password.length < 6) {
      feedback(typeof T === 'function' ? T('passwordTooShort') : 'Mot de passe trop court');
      return;
    }
    if (account.password !== account.confirmation) {
      feedback(typeof T === 'function' ? T('passwordMismatch') : 'Les mots de passe sont différents');
      return;
    }

    setPurchaseButtonsDisabled(true);
    feedback('Ouverture de Google Play…');
    try {
      if (!prices) await loadProducts();
      var result = await plugin().purchase({ basePlanId: plan });
      if (result && result.cancelled) {
        feedback('Achat annulé. Aucun débit effectué.');
        return;
      }
      var purchaseResult = result && result.purchases && result.purchases.find(function (item) {
        return Number(item.purchaseState) === 1;
      });
      if (!purchaseResult) {
        feedback('Paiement en attente de confirmation par Google Play.');
        return;
      }
      feedback('Vérification sécurisée de l’abonnement…');
      await verifyPurchase(purchaseResult, plan, account, false);
      unlockApplication();
    } catch (error) {
      feedback(error && error.code === 'email_taken'
        ? 'Cette adresse possède déjà un compte. Utilise « Déjà client ».'
        : 'L’abonnement n’a pas pu être activé. Réessaie dans un instant.');
    } finally {
      setPurchaseButtonsDisabled(false);
    }
  }

  async function restorePurchases(options) {
    if (!isNativeStore()) return false;
    var silent = options && options.silent;
    try {
      var result = await plugin().restorePurchases();
      var purchases = result && result.purchases || [];
      for (var i = 0; i < purchases.length; i += 1) {
        if (Number(purchases[i].purchaseState) !== 1) continue;
        await verifyPurchase(purchases[i], '', null, true);
        unlockApplication();
        if (!silent) feedback('Abonnement restauré avec succès.');
        return true;
      }
      if (!silent) feedback('Aucun abonnement actif trouvé sur ce compte Google Play.');
    } catch (_error) {
      if (!silent) feedback('Restauration impossible. Vérifie le compte Google Play utilisé.');
    }
    return false;
  }

  async function manageSubscription() {
    if (!isNativeStore()) return;
    await plugin().openSubscriptionManagement();
  }

  function addStoreActions() {
    var paywallCard = document.querySelector('#paywall .paycard')
      || document.querySelector('#paywall .pwcard')
      || document.getElementById('paywall');
    if (!paywallCard || document.querySelector('.native-store-actions')) return;
    var actions = document.createElement('div');
    actions.className = 'native-store-actions';
    actions.innerHTML = '<button type="button" data-restore-store>Restaurer mes achats</button>'
      + '<button type="button" data-manage-store>Gérer mon abonnement</button>';
    paywallCard.appendChild(actions);
  }

  function configure() {
    if (!isNativeStore()) return;
    window.unlock = purchase;
    addStoreActions();
    loadProducts().catch(function () {});
    restorePurchases({ silent: true });

    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-restore-store]')) restorePurchases({ silent: false });
      if (event.target.closest('[data-manage-store]')) manageSubscription();
      if (event.target.closest('[data-plan]')) window.setTimeout(applyStorePrices, 0);
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) restorePurchases({ silent: true });
    });
  }

  window.MelungaStoreBilling = {
    loadProducts: loadProducts,
    restorePurchases: restorePurchases,
    manageSubscription: manageSubscription,
    applyStorePrices: applyStorePrices
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', configure, { once: true });
  } else {
    configure();
  }
})();
