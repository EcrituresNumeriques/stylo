import { useSelector } from 'react-redux'

export function useActiveUserId () {
  return useSelector((state) => state.activeUser._id)
}
