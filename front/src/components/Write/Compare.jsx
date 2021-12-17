import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styles from './Compare.module.scss'

import askGraphQL from '../../helpers/graphQL'
import { DiffEditor } from "@monaco-editor/react"
import CompareSelect from "./CompareSelect";
import { defineFlippedDiffTheme } from "../../helpers/monacoEditor";

const mapStateToProps = ({ applicationConfig }) => {
  return { applicationConfig }
}

const Compare = ({
                   compareTo,
                   md,
                   articleId,
                   selectedVersion,
                   currentArticleVersion,
                   readOnly,
                   articleVersions,
                   applicationConfig
                 }) => {
  const query = `query{ version(version:"${compareTo}"){ _id md } }`
  const [compareMD, setCompareMD] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const data = await askGraphQL(
        { query },
        'fetching version to compareTo',
        null,
        applicationConfig
      )
      setCompareMD(data.version.md)
      setLoading(false)
    })()
  }, [compareTo])

  function handleEditorDidMount (editor, monaco) {
    defineFlippedDiffTheme(monaco)
  }

  return (
    <>
      <CompareSelect
        articleId={articleId}
        selectedVersion={selectedVersion}
        compareTo={compareTo}
        currentArticleVersion={currentArticleVersion}
        readOnly={readOnly}
      />
      <DiffEditor
        className={styles.editor}
        original={md}
        modified={compareMD}
        language="markdown"
        theme="dark"
        options={{
          showFoldingControls: "always",
          readOnly: true,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          scrollBeyondLastLine: false,
          originalAriaLabel: "version 1.0",
          modifiedAriaLabel: "version 2.0",
          renderIndicators: false,
          minimap: {
            enabled: false
          }
        }}
        onMount={handleEditorDidMount}
      />
    </>
  )
}

Compare.propTypes = {
  compareTo: PropTypes.string,
  md: PropTypes.string,
  applicationConfig: PropTypes.object,
}

export default connect(mapStateToProps)(Compare)
