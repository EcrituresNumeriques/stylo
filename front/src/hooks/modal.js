import { useEffect, useRef, useState } from 'react'

function lockBody() {
  document.body.setAttribute('inert', 'true')
  document.body.setAttribute('data-scrolling', 'false')
}

function unlockBody() {
  document.body.removeAttribute('data-scrolling')
  document.body.removeAttribute('inert')
}

export function useModal() {
  const ref = useRef(null)
  const openRef = useRef(false)
  const [visible, setVisible] = useState(false)

  // si le composant est démonté alors que la modale est ouverte (navigation, erreur de rendu),
  // la page ne doit pas rester inerte
  useEffect(() => {
    return () => {
      if (openRef.current) {
        openRef.current = false
        unlockBody()
      }
    }
  }, [])

  function close() {
    ref.current?.close()
    openRef.current = false
    setVisible(false)
    unlockBody()
  }

  function show() {
    ref.current?.showModal()
    openRef.current = true
    setVisible(true)
    lockBody()
  }

  return {
    bindings: {
      ref,
      visible,
      cancel: close,
    },
    show,
    close,
  }
}
