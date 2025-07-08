export function trackEvent(category, action, name, value, attrs) {
  // matomo
  const _paq = (window._paq = window._paq || [])
  if (_paq && typeof _paq.push === 'function') {
    _paq.push(['trackEvent', category, action, name, value, attrs])
  }
}
