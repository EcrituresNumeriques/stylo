import MonacoTextEditor from './TextEditor'
import MonacoDiffEditor from './DiffEditor'


export default function Editor ({
                                  text,
                                  articleId,
                                  selectedVersion,
                                  compareTo,
                                  currentArticleVersion,
                                  readOnly,
                                  onTextUpdate,
                                }) {
  return (
    <>
      {!compareTo && <MonacoTextEditor
        text={text}
        readOnly={readOnly}
        onTextUpdate={onTextUpdate}/>
      }
      {compareTo && <MonacoDiffEditor
        text={text}
        articleId={articleId}
        selectedVersion={selectedVersion}
        compareTo={compareTo}
        currentArticleVersion={currentArticleVersion}
        readOnly={readOnly}
        onTextUpdate={onTextUpdate}
      />}
    </>
  )
}