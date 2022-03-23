import CompareSelect from "../../CompareSelect";
import styles from "./DiffEditor.module.scss";
import TextEditor from "./TextEditor";
import Compare from "../../Compare";


export default function DiffEditor ({ text, compareTo, articleId, selectedVersion, currentArticleVersion, readOnly, onTextUpdate }) {
  return (
    <>
      <CompareSelect
        articleId={articleId}
        selectedVersion={selectedVersion}
        compareTo={compareTo}
        currentArticleVersion={currentArticleVersion}
        readOnly={readOnly}
      />
      <article className={styles.diffEditor}>
        <>
          <TextEditor text={text} readOnly={readOnly} onTextUpdate={onTextUpdate} />
          <Compare compareTo={compareTo} md={text} />
        </>
      </article>
    </>
  )
}