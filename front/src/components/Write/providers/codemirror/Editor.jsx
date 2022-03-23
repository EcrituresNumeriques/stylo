import TextEditor from './TextEditor'
import styles from './Editor.module.scss'
import DiffEditor from './DiffEditor'


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
      {!compareTo && <TextEditor
        className={styles.editor}
        text={text}
        readOnly={readOnly}
        onTextUpdate={onTextUpdate}/>
      }
      {compareTo && <DiffEditor
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