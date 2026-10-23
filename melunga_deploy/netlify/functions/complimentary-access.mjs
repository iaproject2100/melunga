/* An explicit, per-account owner grant. Ordinary subscriptions keep their expiry. */
export function hasPermanentAccess(account) {
  const grant = account && account.complimentaryAccess;
  return !!(grant && grant.status === 'active' && grant.permanent === true);
}

export function accountHasAccess(account, now = Date.now()) {
  return hasPermanentAccess(account)
    || !!(account && account.paid && account.expiry && account.expiry > now);
}

export function accessExpiry(account) {
  return hasPermanentAccess(account) ? null : account && account.expiry;
}
