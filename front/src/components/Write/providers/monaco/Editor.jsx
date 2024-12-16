import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import MonacoTextEditor from './TextEditor'
import MonacoDiffEditor from './DiffEditor'

export default function Editor({
  text,
  articleId,
  selectedVersion,
  compareTo,
  currentArticleVersion,
  readOnly,
  onTextUpdate,
}) {
  const location = useLocation()
  const isComparing = useMemo(
    () => location.pathname.includes('/compare'),
    [location.pathname, compareTo]
  )

  return (
    <>
      {!isComparing && (
        <MonacoTextEditor
          text={text}
          readOnly={readOnly}
          onTextUpdate={onTextUpdate}
        />
      )}
      {isComparing && (
        <MonacoDiffEditor
          text={text}
          articleId={articleId}
          selectedVersion={selectedVersion}
          compareTo={compareTo}
          currentArticleVersion={currentArticleVersion}
          readOnly={readOnly}
          onTextUpdate={onTextUpdate}
        />
      )}
    </>
  )
}
