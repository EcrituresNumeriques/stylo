import { useState, useEffect } from 'react'

export default (live, delay) => {
  const [debouncedLive, setDebouncedLive] = useState(live)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedLive(live)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [live])

  return debouncedLive
}
