import useSWRImmutable from 'swr/immutable'

import { applicationConfig } from '../config.js'

const fetcher = (url) => fetch(url).then((response) => response.json())

/**
 * Versions des services d'export utilisés par l'instance, lues sur la route
 * `/version` de l'API. Une version vaut `null` tant qu'elle n'est pas chargée
 * ou quand l'instance ne la renseigne pas (développement local).
 *
 * @returns {{ exportVersion: string | null, pandocApiVersion: string | null }}
 */
export function useInstanceVersions() {
  const { data } = useSWRImmutable(
    `${applicationConfig.backendEndpoint}/version`,
    fetcher
  )

  return {
    exportVersion: data?.exportVersion ?? null,
    pandocApiVersion: data?.pandocApiVersion ?? null,
  }
}
