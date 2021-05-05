import React from 'react'
import { connect } from 'react-redux'

import Reference from './Reference'

function ReferenceList ({ articleBibTeXEntries }) {
  return (
    <>
      {articleBibTeXEntries
        .map((entry, index) => (
          <Reference key={`ref-${entry.key}-${index}`} entry={entry}/>
        ))
      }
    </>
  )
}

const mapStateToProps = ({ articleBibTeXEntries }) => {
  return { articleBibTeXEntries }
}

const ConnectedReferenceList = connect(mapStateToProps)(ReferenceList)
export default ConnectedReferenceList
