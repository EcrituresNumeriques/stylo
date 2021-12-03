import React, { useEffect, useState } from 'react'
import DiffMatchPatch from 'diff-match-patch'
import PropTypes from 'prop-types'

import { useGraphQL } from '../../helpers/graphQL'

const computeDiff = (text1, text2) => {
  let dmp = new DiffMatchPatch()
  let d = dmp.diff_main(text1, text2)
  dmp.diff_cleanupSemantic(d)
  return dmp.diff_prettyHtml(d)
}

export default function Compare ({ compareTo, md }) {
  const query = `query{ version(version:"${compareTo}"){ _id md } }`
  const [compareMD, setCompareMD] = useState('')
  const [loading, setLoading] = useState(true)
  const runQuery = useGraphQL()


  useEffect(() => {
    (async () => {
      setLoading(true)
      const data = await runQuery({ query })
      setCompareMD(data.version.md)
      setLoading(false)
    })()
  }, [compareTo])

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: loading ? '<p>loading</p>' : computeDiff(compareMD, md),
      }}
    ></div>
  )
}

Compare.propTypes = {
  compareTo: PropTypes.string,
  md: PropTypes.string,
}
