import { useRouteLoaderData } from 'react-router'

/**
 * Whether a feature is enabled for the active user, as resolved by the API.
 *
 * @param {string} name
 * @returns {boolean}
 */
export function useFeature(name) {
  const { user } = useRouteLoaderData('app') ?? {}
  return user?.features?.includes(name) ?? false
}
