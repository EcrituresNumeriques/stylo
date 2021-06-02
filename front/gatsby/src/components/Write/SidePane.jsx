import React, { useState } from 'react'
import WriteLeft from './WriteLeft'
import WriteRight from './WriteRight'

import styles from './SidePane.module.scss'
import { FileText, Package } from "react-feather";

export default function SidePane (props) {
  const [isDocumentPaneExpanded, setDocumentPaneExpanded] = useState(false)
  const [isMetadataPaneExpanded, setMetadataPaneExpanded] = useState(false)

  return (<>
    <nav className={styles.navigation}>
      <a className={[styles.navbarItem, isDocumentPaneExpanded ? styles.navbarItemExpanded : ''].join(' ')}
         onClick={() => {
           setMetadataPaneExpanded(false)
           setDocumentPaneExpanded(!isDocumentPaneExpanded)
         }}>
        <FileText/> Document
      </a>
      <a className={[styles.navbarItem, isMetadataPaneExpanded ? styles.navbarItemExpanded : ''].join(' ')}
         onClick={() => {
           setDocumentPaneExpanded(false)
           setMetadataPaneExpanded(!isMetadataPaneExpanded)
         }}>
        <Package/> Metadata
      </a>
    </nav>
    {(isDocumentPaneExpanded || isMetadataPaneExpanded) && <div class={styles.menu}>
      {isDocumentPaneExpanded && <WriteLeft
        article={props.articleInfos}
        {...props.live}
        compareTo={props.compareTo}
        selectedVersion={props.version}
        versions={props.versions}
        readOnly={props.readOnly}
        sendVersion={props.sendVersion}
        handleBib={props.handleBib}
        setCodeMirrorCursor={props.setCodeMirrorCursor}
      />}
      {isMetadataPaneExpanded && <WriteRight
        {...props.live}
        handleYaml={props.handleYaml}
        readOnly={props.readOnly}
      />}
    </div>}
  </>)
}
