import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import DiffMatchPatch from 'diff-match-patch'

import askGraphQL from '../../helpers/graphQL'

const mapStateToProps = ({ activeUser, applicationConfig }) => {
  return { activeUser, applicationConfig }
}

const Compare = ({ compareTo, live, applicationConfig }) => {
  const query = `query{ version(version:"${compareTo}"){ _id md } }`
  const [compareMD, setCompareMD] = useState('')
  const [loading, setLoading] = useState(true)
  const computeDiff = (text1, text2) => {
    let dmp = new DiffMatchPatch()
    let d = dmp.diff_main(text1, text2)
    dmp.diff_cleanupSemantic(d)
    return dmp.diff_prettyHtml(d)
  }

  useEffect(() => {
    ;(async () => {
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

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: loading
          ? '<p>loading</p>'
          : computeDiff(compareMD, live.md),
      }}
    ></div>
  )
}

export default connect(mapStateToProps)(Compare)
