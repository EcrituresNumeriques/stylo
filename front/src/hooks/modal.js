import { useRef, useState } from 'react'

export function useModal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  function close() {
    ref.current?.close()
    setVisible(false)
    document.body.removeAttribute('data-scrolling')
    document.body.removeAttribute('inert')
  }

  function show() {
    ref.current?.showModal()
    setVisible(true)
    document.body.setAttribute('inert', 'true')
    document.body.setAttribute('data-scrolling', 'false')
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
