import React, {useEffect,useState} from 'react'
import { connect } from 'react-redux'
import { navigate } from 'gatsby'

import askGraphQL from '../helpers/graphQL';
import styles from './write.module.scss'

const mapStateToProps = ({ logedIn, sessionToken, users }) => {
  return { logedIn, sessionToken, users  }
}

const ConnectedWrite = (props) => {
  if(!props.logedIn){
    navigate('/login')
    return (<p>Redirecting...</p>)
  }
  const readOnly = props.version? true:false;
  const query = "query($article:ID!){article(article:$article){ title owners { displayName } versions(limit:1){ md sommaire bib yaml message} } }"
  const variables = {user:props.users[0]._id,article:props.id}
  const [isLoading,setIsLoading] = useState(false)
  const [live, setLive] = useState({})

  useEffect(()=>{
    (async () => {
      setIsLoading(true)
      const data = await askGraphQL({query,variables},'fetching Live version',props.sessionToken)
      setLive(data.article.versions[0])
      setIsLoading(false)
    })()

    
    console.log("trigger use effect")
  },[])

  return (
    <section>
      <article className={styles.article}>
        {readOnly && <p>ReadOnly</p>}
        Writing {props.id} {props.version}
        {isLoading && <p>Loading...</p>}
        {!isLoading && <p>{JSON.stringify(live)}</p>}
      </article>
    </section>
  )
}

const Write = connect(
  mapStateToProps
)(ConnectedWrite)

export default Write