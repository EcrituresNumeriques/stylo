import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Eye, Printer } from 'react-feather'

import styles from './writeLeft.module.scss'
import Biblio from './Biblio'
import Sommaire from './Sommaire'
import Versions from './Versions'
import Button from "../Button";
import { Link } from "react-router-dom";
import buttonStyles from "../button.module.scss";
import Metadata from "./Metadata";
import FocusMode from './FocusMode'
import { generateArticleExportId } from '../../helpers/identifier'

import Modal from '../Modal'
import Export from '../Export'

export default function WriteLeft ({ articleInfos, readOnly, compareTo, yaml, handleYaml, selectedVersion }) {
  const [exporting, setExporting] = useState(false)
  const focusMode = useSelector(state => state.articlePreferences.focusMode)

  const expanded = !focusMode

  return (
    <div className={[styles.side, expanded ? styles.expanded : ''].join(' ')}>
      <FocusMode className={styles.focusMode} />

      {exporting && (
          <Modal cancel={() => setExporting(false)}>
            <Export
              exportId={generateArticleExportId(articleInfos.title)}
              articleVersionId={articleInfos._id}
            />
          </Modal>
        )}

      <nav className={styles.menu}>
        <ul className={styles.actions}>
          {!focusMode && <>
            <li>
              <Link
              to={`/article/${articleInfos._id}/preview`}
                target="_blank"
                rel="noopener noreferrer"
                className={[buttonStyles.button, buttonStyles.secondary].join(' ')}
              >
                <Eye /> Preview
              </Link>
            </li>
            <li>
              <Button onClick={() => setExporting(true)}>
                <Printer /> Export
              </Button>
            </li>
          </>}
        </ul>

        <Versions
          article={articleInfos}
          selectedVersion={selectedVersion}
          compareTo={compareTo}
          readOnly={readOnly}
        />
        <Biblio readOnly={readOnly} article={articleInfos} />
        <Sommaire />
        <Metadata
          yaml={yaml}
          handleYaml={handleYaml}
          readOnly={readOnly}
        />
      </nav>
    </div>
  )
}
