function percentToHexRound(percent) {
  return `0${Math.round((255 / 100) * percent).toString(16)}`
    .slice(-2)
    .toUpperCase()
}

export default function rrggbbaa(hex, alpha) {
  return `${hex}${percentToHexRound(alpha)}`
}
