/* Owner-only operation. Credentials stay in this page's memory and are never
 * written to a URL, browser storage, analytics, logs, or a third-party endpoint. */
(function () {
  'use strict';
  var targetEmail = 'contact@melunga.com';
  var production = window.location.origin === 'https://melunga.com';
  var key = document.getElementById('adminKey');
  var password = document.getElementById('accountPassword');
  var inspectButton = document.getElementById('inspectButton');
  var activateButton = document.getElementById('activateButton');
  var clearButton = document.getElementById('clearButton');
  var passwordSection = document.getElementById('passwordSection');
  var accountState = document.getElementById('accountState');
  var successPanel = document.getElementById('successPanel');
  var status = document.getElementById('status');
  var inspection = null;
  var requestId = null;
  var busy = false;
  var generation = 0;
  var controller = null;
  var messages = {
    unauthorized: 'La clé d’administration n’est pas reconnue. Copie à nouveau ADMIN_SECRET depuis Netlify.',
    existing_password_mismatch: 'Le compte existe déjà et ce mot de passe ne correspond pas. Son mot de passe n’a pas été modifié.',
    invalid_password: 'Le mot de passe doit contenir au moins 8 caractères.',
    account_changed: 'Le compte a changé pendant la vérification. Clique à nouveau sur « Vérifier la clé ».',
    inspection_required: 'Clique d’abord sur « Vérifier la clé ».',
    production_required: 'L’activation doit se faire sur melunga.com.',
    legacy_session_requires_review: 'Un ancien appareil nécessite une vérification avant l’activation. Le compte n’a pas été modifié.',
    existing_device_limit_exceeded: 'Ce compte possède déjà plus de 30 appareils. Une vérification est nécessaire avant l’activation.',
    invalid_device_registry: 'Les appareils enregistrés nécessitent une vérification. Le compte n’a pas été modifié.',
    duplicate_device_identity: 'Les appareils enregistrés nécessitent une vérification. Le compte n’a pas été modifié.',
    account_identity_mismatch: 'L’identité du compte nécessite une vérification. Le compte n’a pas été modifié.',
    network_error: 'La connexion au serveur n’a pas abouti. L’activation n’est pas confirmée ; tu peux réessayer.',
    service_unavailable: 'Le serveur est momentanément indisponible. L’activation n’est pas confirmée ; tu peux réessayer.',
    activation_not_confirmed: 'Le serveur n’a pas confirmé l’activation. Clique sur « Vérifier la clé » pour connaître l’état du compte.'
  };

  function message(text, kind) {
    status.textContent = text;
    status.dataset.kind = kind || 'info';
  }
  function errorMessage(code) {
    return Object.hasOwn(messages, code) ? messages[code]
      : 'L’opération n’a pas été confirmée. Vérifie la clé ou réessaie dans un instant.';
  }
  function setBusy(value) {
    busy = value;
    key.disabled = value || !production;
    password.disabled = value || !production;
    inspectButton.disabled = value || !production;
    activateButton.disabled = value || !production || !inspection;
    clearButton.disabled = value;
  }
  function invalidate() {
    inspection = null;
    requestId = null;
    password.value = '';
    passwordSection.hidden = true;
    accountState.hidden = true;
    successPanel.hidden = true;
    activateButton.disabled = true;
  }
  function clear() {
    generation += 1;
    if (controller) controller.abort();
    controller = null;
    key.value = '';
    invalidate();
    setBusy(false);
  }
  function validState(state) {
    return state && typeof state === 'object' && state.email === targetEmail
      && typeof state.revision === 'string' && !!state.revision;
  }
  function confirmed(state) {
    return validState(state) && state.permanent === true && state.accessActive === true
      && state.deviceLimit === 30 && state.canActivate === true
      && Number.isInteger(state.registeredDevices) && state.registeredDevices >= 0
      && state.registeredDevices <= 30;
  }
  function displayState(state) {
    document.getElementById('accountExists').textContent = state.exists
      ? 'Compte existant : contact@melunga.com' : 'Nouveau compte : contact@melunga.com';
    document.getElementById('registeredCount').textContent = Number.isInteger(state.registeredDevices)
      ? String(state.registeredDevices) : 'À vérifier';
    accountState.hidden = false;
  }
  function showSuccess(state, alreadyActive) {
    key.value = '';
    invalidate();
    displayState(state);
    successPanel.hidden = false;
    message(alreadyActive ? 'Le compte partagé est déjà actif : tout le contenu est offert, sans expiration, pour 30 appareils.'
      : 'Compte partagé activé : tout le contenu est offert, sans expiration, pour 30 appareils.', 'success');
  }
  async function call(body) {
    var requestController = new AbortController();
    controller = requestController;
    var timer = setTimeout(function () { requestController.abort(); }, 20000);
    try {
      var response = await fetch('/.netlify/functions/admin-shared-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key.value.trim() },
        credentials: 'omit', cache: 'no-store', redirect: 'error',
        signal: requestController.signal,
        body: JSON.stringify(body)
      });
      var data = await response.json();
      if (!response.ok || !data || data.success !== true) {
        throw new Error(data && typeof data.error === 'string' ? data.error : 'service_unavailable');
      }
      if (!validState(data.state)) throw new Error('service_unavailable');
      return data.state;
    } catch (error) {
      throw new Error(Object.hasOwn(messages, error.message) ? error.message : 'network_error');
    } finally {
      clearTimeout(timer);
      if (controller === requestController) controller = null;
    }
  }

  document.getElementById('keyForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    if (busy || !production || !key.value.trim()) return;
    invalidate();
    var attempt = ++generation;
    setBusy(true);
    message('Vérification du compte…');
    try {
      var state = await call({ action: 'inspect' });
      if (attempt !== generation) return;
      displayState(state);
      if (confirmed(state)) {
        showSuccess(state, true);
      } else if (state.canActivate !== true || !Number.isInteger(state.registeredDevices)
          || state.registeredDevices < 0 || state.registeredDevices > 30) {
        message(errorMessage(state.blocker || 'invalid_device_registry'), 'error');
      } else {
        inspection = state;
        requestId = crypto.randomUUID();
        passwordSection.hidden = false;
        message('Clé vérifiée. Saisis le mot de passe du compte, puis active l’accès offert.');
      }
    } catch (error) {
      if (attempt === generation) message(errorMessage(error.message), 'error');
    } finally {
      if (attempt === generation) setBusy(false);
    }
  });
  document.getElementById('passwordForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    if (busy || !production || !inspection || !requestId) return;
    if (password.value.length < 8 || password.value.length > 1024) {
      message(errorMessage('invalid_password'), 'error');
      return;
    }
    var attempt = ++generation;
    var body = { action: 'activate', expectedRevision: inspection.revision,
      requestId: requestId, password: password.value };
    password.value = '';
    setBusy(true);
    message('Activation du compte partagé…');
    try {
      var state = await call(body);
      if (attempt !== generation) return;
      if (!confirmed(state)) throw new Error('activation_not_confirmed');
      showSuccess(state, false);
    } catch (error) {
      if (attempt !== generation) return;
      if (['account_changed', 'inspection_required', 'unauthorized', 'production_required'].includes(error.message)) invalidate();
      message(errorMessage(error.message), 'error');
    } finally {
      body.password = '';
      if (attempt === generation) setBusy(false);
    }
  });
  key.addEventListener('input', function () {
    invalidate();
    if (!busy && production) message('Clique sur « Vérifier la clé » avant de continuer.');
  });
  clearButton.addEventListener('click', function () {
    if (busy) return;
    clear();
    message(production ? 'Les champs ont été effacés.' : 'L’activation est disponible uniquement sur melunga.com.');
  });
  window.addEventListener('pagehide', clear);
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      clear();
      message(production ? 'Saisis la clé Netlify pour vérifier le compte.' : 'L’activation est disponible uniquement sur melunga.com.');
    }
  });
  clear();
  if (production) message('Saisis la clé Netlify, puis clique sur « Vérifier la clé ».');
  else {
    document.getElementById('productionLink').hidden = false;
    message('Cette page d’aperçu ne peut pas activer le compte. Ouvre la page sur melunga.com.');
  }
}());
