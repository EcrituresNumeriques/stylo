import React, { Suspense } from 'react'
import { useSelector } from 'react-redux'

import Loading from '../components/Loading'

export default function StyloApp ({ children }) {
  const hasBooted = useSelector(state => state.hasBooted)

  return (
    <main>
      <Suspense fallback={<Loading />}>
        {hasBooted ? (children) : <Loading />}
      </Suspense>
    </main>
  )
}
