import { useRef } from 'react'

export function useModal() {
  const ref = useRef(null)

  const onClick = (event) => {
    if (!event.target.contains(ref.current)) return
    ref.current.close()
  }

  return {
    ref,
    isOpen: () => {
      return ref.current.open
    },
    show: () => {
      ref.current.showModal()
      document.body.setAttribute('data-scrolling', 'false')
      document.addEventListener('click', onClick)
    },
    close: () => {
      ref.current.close()
      document.body.removeAttribute('data-scrolling')
      document.removeEventListener('click', onClick)
    },
  }
}
