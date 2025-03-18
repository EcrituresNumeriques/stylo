import { useRef, useState } from 'react'

export function useModal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  const onClick = (event) => {
    if (!event.target.contains(ref.current)) return
    close()
  }

  function close() {
    ref.current.close()
    setVisible(false)
    document.body.removeAttribute('data-scrolling')
    document.removeEventListener('click', onClick)
  }

  function show() {
    ref.current.showModal()
    setVisible(true)
    document.body.setAttribute('data-scrolling', 'false')
    document.addEventListener('click', onClick)
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
