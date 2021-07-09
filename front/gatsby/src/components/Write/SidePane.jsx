import React, { useCallback, useEffect, useMemo, useState } from 'react'
import WriteRight from './WriteRight'

import styles from './SidePane.module.scss'
import { Activity, BookOpen, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit3, FileText, List, Package } from "react-feather";
import bib2key from "./bibliographe/CitationsFilter";
import { connect } from "react-redux";
import Biblio from "./Biblio";
import Sommaire from "./Sommaire";
import Versions from "./Versions";
import Stats from "./Stats";
import Button from "../Button";

const mapStateToProps = ({ articleStats, articleStructure }) => ({ articleStats, articleStructure })

function SidePane (props) {
  const articleStructure = props.articleStructure
  const bibTeXEntries = useMemo(() => bib2key(props.live.bib), [props.live.bib])

  const [isDocumentPaneExpanded, setDocumentPaneExpanded] = useState(false)
  const [isTableOfContentsPaneExpanded, setTableOfContentsPaneExpanded] = useState(false)
  const [isVersionsPaneExpanded, setVersionsPaneExpanded] = useState(false)
  const [isBibliographyPaneExpanded, setBibliographyPaneExpanded] = useState(false)
  const [isStatsPaneExpanded, setStatsPaneExpanded] = useState(false)
  const [isMetadataPaneExpanded, setMetadataPaneExpanded] = useState(false)
  const [showTitle, setShowTitle] = useState(true)

  const hide = useCallback(() => {
    setDocumentPaneExpanded(false)
    setTableOfContentsPaneExpanded(false)
    setVersionsPaneExpanded(false)
    setBibliographyPaneExpanded(false)
    setStatsPaneExpanded(false)
    setMetadataPaneExpanded(false)
  }, [])

  return (<>
    <nav className={styles.navigation}>
      <a title="Versions"
         className={[styles.navbarItem, isVersionsPaneExpanded ? styles.navbarItemExpanded : ''].join(' ')}
         onClick={useCallback(() => {
           hide()
           setVersionsPaneExpanded(!isVersionsPaneExpanded)
         })}>
        <FileText/> {showTitle && "Versions"}
      </a>
      {articleStructure.length > 0 &&
      <a title="Table Of Contents"
         className={[styles.navbarItem, isTableOfContentsPaneExpanded ? styles.navbarItemExpanded : ''].join(' ')}
         onClick={useCallback(() => {
           hide()
           setTableOfContentsPaneExpanded(!isTableOfContentsPaneExpanded)
         })}>
        <List/> {showTitle && "Table Of Contents"}
      </a>
      }
      <a title="Bibligraphy"
         className={[styles.navbarItem, isBibliographyPaneExpanded ? styles.navbarItemExpanded : ''].join(' ')}
         onClick={useCallback(() => {
           hide()
           setBibliographyPaneExpanded(!isBibliographyPaneExpanded)
         })}>
        <BookOpen/> {showTitle && "Bibligraphy"}
      </a>
      <a title="Stats" className={[styles.navbarItem, isStatsPaneExpanded ? styles.navbarItemExpanded : ''].join(' ')}
         onClick={useCallback(() => {
           hide()
           setStatsPaneExpanded(!isStatsPaneExpanded)
         })}>
        <Activity/> {showTitle && "Stats"}
      </a>
      <a title="Metadata"
         className={[styles.navbarItem, isMetadataPaneExpanded ? styles.navbarItemExpanded : ''].join(' ')}
         onClick={useCallback(() => {
           hide()
           setMetadataPaneExpanded(!isMetadataPaneExpanded)
         })}>
        <Package/> {showTitle && "Metadata"}
      </a>
      <div className={styles.expandColapseAction}>
        {showTitle &&  <a title="Colapse menu" className={[styles.navbarItem, styles.navbarColapseItem].join(' ')} onClick={() => setShowTitle(false)}><ChevronsLeft /> Colapse menu</a>}
        {!showTitle && <a title="Expand menu" className={[styles.navbarItem, styles.navbarExpandItem].join(' ')} onClick={() => setShowTitle(true)}><ChevronsRight /></a>}
      </div>
    </nav>
    {(isDocumentPaneExpanded || isVersionsPaneExpanded || isTableOfContentsPaneExpanded || isBibliographyPaneExpanded || isMetadataPaneExpanded || isStatsPaneExpanded) &&
    <div className={styles.menu}>
      {isVersionsPaneExpanded &&
      <Versions article={props.articleInfos} compareTo={props.compareTo} sendVersion={props.sendVersion}
                readOnly={props.readOnly} versions={props.versions} selectedVersion={props.version} {...props.live} />}
      {isTableOfContentsPaneExpanded && <Sommaire md={props.md} setCodeMirrorCursor={props.setCodeMirrorCursor}/>}
      {isBibliographyPaneExpanded &&
      <Biblio bibTeXEntries={bibTeXEntries} readOnly={props.readOnly} bib={props.live.bib} handleBib={props.handleBib}
              article={props.articleInfos}/>}
      {isStatsPaneExpanded && <Stats stats={props.articleStats}/>}
      {isMetadataPaneExpanded && <WriteRight
        {...props.live}
        handleYaml={props.handleYaml}
        readOnly={props.readOnly}
      />}
    </div>}
  </>)
}

export default connect(mapStateToProps)(SidePane)
