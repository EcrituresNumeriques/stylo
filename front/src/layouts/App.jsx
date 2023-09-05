import { Loading } from '@geist-ui/core'
import React, { Suspense } from 'react'
import { useSelector } from 'react-redux'


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
