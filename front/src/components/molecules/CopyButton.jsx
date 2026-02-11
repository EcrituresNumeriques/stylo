import { Clipboard } from 'lucide-react'
import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { useCopyToClipboard } from 'react-use'

import { Button } from '../atoms/index.js'

export const CopyButton = memo(function CopyButton({ text, className }) {
  const { t } = useTranslation('molecule', { useSuspense: false })
  const [, copyToClipboard] = useCopyToClipboard()

  const handleCopy = useCallback(() => {
    copyToClipboard(text)
    toast(t('copyButton.success', { text }), {
      type: 'info',
    })
  }, [])

  return (
    <Button
      title={t('copyButton.title', { text })}
      className={className}
      onClick={handleCopy}
      icon
    >
      <Clipboard />
    </Button>
  )
})
