const { isIPv4, isIPv6 } = require('node:net')

/**
 * Keeps the network part of an address: /24 in IPv4, /48 in IPv6.
 *
 * @param {string} [ip]
 * @returns {string|null}
 */
function truncateIp(ip) {
  const ipv4 = ip?.replace(/^::ffff:/i, '')
  if (isIPv4(ipv4)) {
    return ipv4.replace(/\.\d+$/, '.0')
  }
  if (!isIPv6(ip)) {
    return null
  }

  const [head, tail] = ip
    .split('::')
    .map((part) => (part ? part.split(':') : []))
  const zeros = Array(8 - head.length - (tail?.length ?? 0)).fill('0')
  const prefix = [...head, ...zeros, ...(tail ?? [])].slice(0, 3)

  return `${prefix.map((group) => parseInt(group, 16).toString(16)).join(':')}::`
}

/**
 * @param {object} params
 * @param {string} [params.ip]
 * @param {string} params.strategy passport strategy name (local, humanid, zotero, hypothesis)
 * @param {Date} [params.at]
 * @returns {{ at: Date, ip: string|null, strategy: string }}
 */
function createAccess({ ip, strategy, at = new Date() }) {
  return { at, ip: truncateIp(ip), strategy }
}

module.exports = { createAccess }
