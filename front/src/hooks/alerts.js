import { useCallback, useState } from 'react'

const storageKey = 'dismissedAlerts'

/**
 * @returns {string[]}
 */
function readDismissedAlerts() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey))
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

/**
 * Messages affichés en haut de l'écran que l'utilisateur·ice a masqués.
 * La liste est conservée dans le localStorage pour survivre au rechargement
 * de la page (et à la déconnexion).
 *
 * @returns {{ isDismissed: (id: string) => boolean, dismiss: (id: string) => void }}
 */
export function useDismissedAlerts() {
  const [dismissedIds, setDismissedIds] = useState(readDismissedAlerts)

  const isDismissed = useCallback(
    (id) => dismissedIds.includes(id),
    [dismissedIds]
  )

  const dismiss = useCallback((id) => {
    const ids = [...new Set([...readDismissedAlerts(), id])]
    try {
      localStorage.setItem(storageKey, JSON.stringify(ids))
    } catch {
      // le message reste masqué jusqu'au prochain rechargement
    }
    setDismissedIds(ids)
  }, [])

  return { isDismissed, dismiss }
}
