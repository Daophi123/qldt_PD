let pendingNotice = null

export function setLoginNotice(message) {
  pendingNotice = message
}

export function peekLoginNotice() {
  return pendingNotice
}

export function clearLoginNotice() {
  pendingNotice = null
}
