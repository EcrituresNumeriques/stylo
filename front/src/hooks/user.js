
import { useSelector } from 'react-redux'

export function useActiveUserId () {
  return useSelector((state) => state.userPreferences.currentUser ?? state.activeUser._id)
}
