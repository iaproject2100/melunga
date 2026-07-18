import crypto from 'node:crypto';

const MOBILE_UA = /Android|iPhone|iPad|iPod|Mobile|Tablet/i;

export function cleanDeviceId(value) {
  return value ? String(value).trim().slice(0, 128) : '';
}

export function cleanEmail(value) {
  return value ? String(value).trim().toLowerCase().slice(0, 254) : '';
}

export function deviceTypeFor(req, declaredType) {
  const ua = req.headers.get('user-agent') || '';
  const detected = MOBILE_UA.test(ua) ? 'mobile' : 'desktop';

  /*
   * Une application Capacitor annonce explicitement "mobile". Pour le site,
   * la détection par User-Agent reste la référence afin qu'un simple champ
   * envoyé par le navigateur ne permette pas de choisir librement un slot.
   */
  if (declaredType === 'mobile' && detected === 'mobile') return 'mobile';
  if (declaredType === 'desktop' && detected === 'desktop') return 'desktop';
  return detected;
}

export function deviceLabelFor(req, suppliedLabel, deviceType) {
  if (suppliedLabel) {
    return String(suppliedLabel)
      .replace(/[^\p{L}\p{N} ._()/-]/gu, '')
      .trim()
      .slice(0, 80);
  }

  const ua = req.headers.get('user-agent') || '';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/iPhone|iPod/i.test(ua)) return 'iPhone';
  if (/Android/i.test(ua)) return /Mobile/i.test(ua) ? 'Téléphone Android' : 'Tablette Android';
  if (/Windows/i.test(ua)) return 'Ordinateur Windows';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'Mac';
  if (/Linux/i.test(ua)) return 'Ordinateur Linux';
  return deviceType === 'mobile' ? 'Appareil mobile' : 'Ordinateur';
}

export function ensureDeviceSlots(account) {
  const devices = account && account.devices && typeof account.devices === 'object'
    ? account.devices
    : {};
  return {
    desktop: devices.desktop || null,
    mobile: devices.mobile || null
  };
}

export function makeDeviceSlot({
  deviceId,
  deviceType,
  deviceLabel,
  previousSlot = null,
  now = Date.now()
}) {
  return {
    deviceId,
    deviceType,
    label: deviceLabel,
    created: previousSlot && previousSlot.deviceId === deviceId
      ? previousSlot.created || now
      : now,
    lastSeen: now,
    updated: now
  };
}

export function safeDeviceSummary(slot) {
  if (!slot) return null;
  return {
    type: slot.deviceType || null,
    label: slot.label || null,
    lastSeen: slot.lastSeen || null
  };
}

export function randomSessionToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashSessionToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}
