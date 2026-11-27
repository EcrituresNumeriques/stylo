import { useEffect, useRef, useState } from 'react'

// modals can be nested: the page stays locked until the last one is closed
let openModals = 0

function lockBody() {
  if (openModals++ === 0) {
    document.body.setAttribute('inert', 'true')
    document.body.setAttribute('data-scrolling', 'false')
  }
}

function unlockBody() {
  if (--openModals === 0) {
    document.body.removeAttribute('data-scrolling')
    document.body.removeAttribute('inert')
  }
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

  // called twice when closed from a button: by the button, then by the close event
  function close() {
    if (!openRef.current) return
    openRef.current = false
    ref.current?.close()
    setVisible(false)
    unlockBody()
  }

  function show() {
    if (openRef.current) return
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
