import { useRef, useState } from 'react'

export function useModal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  const onClick = (event) => {
    if (!event.target.contains(ref.current)) return

    if (
      event.offsetX < event.target.offsetWidth &&
      event.offsetY < event.target.offsetHeight
    ) {
      // click is on scrollbar
      return
    }
    close()
  }

  function close() {
    ref.current?.close()
    setVisible(false)
    document.body.removeAttribute('data-scrolling')
    document.removeEventListener('mousedown', onClick)
  }

  function show() {
    ref.current?.showModal()
    setVisible(true)
    document.body.setAttribute('data-scrolling', 'false')
    document.addEventListener('mousedown', onClick)
  }

  return {
    bindings: {
      ref,
      visible,
      cancel: () => close(),
    },
    show,
    close,
  }
}
