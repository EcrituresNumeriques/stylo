/**
 * @file Feature flags, resolved by the API in `User.features`.
 * @module hooks/features
 */
import { useSelector } from 'react-redux'

/**
 * Tells if a feature is enabled for the active user.
 * A change made with the `features` command is taken into account on the next page load.
 * @param {string} name - The feature name (e.g. "nakala").
 * @returns {boolean}
 */
export function useFeature(name) {
  return useSelector(
    (state) => state.activeUser.features?.includes(name) ?? false
  )
}
