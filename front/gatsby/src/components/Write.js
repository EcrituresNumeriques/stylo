import React, {useEffect,useState} from 'react'
import { connect } from 'react-redux'
import { navigate } from 'gatsby'

import askGraphQL from '../helpers/graphQL';
import styles from './write.module.scss'

import WriteLeft from './Write/WriteLeft'

const mapStateToProps = ({ logedIn, sessionToken, users }) => {
  return { logedIn, sessionToken, users  }
}

const ConnectedWrite = (props) => {
  if(!props.logedIn){
    navigate('/login')
    return (<p>Redirecting...</p>)
  }
  const readOnly = props.version? true:false;
  const query = "query($article:ID!){article(article:$article){ title owners { displayName } live{ md sommaire bib yaml message} versions{ _id version revision message autosave } } }"
  const variables = {user:props.users[0]._id,article:props.id}
  const [isLoading,setIsLoading] = useState(true)
  const [live, setLive] = useState({})
  const [versions, setVersions] = useState([])
  const [articleInfos, setArticleInfos] = useState({title:"",owners:[]})

  useEffect(()=>{
    (async () => {
      setIsLoading(true)
      const data = await askGraphQL({query,variables},'fetching Live version',props.sessionToken)
      setLive(data.article.live)
      setArticleInfos({title:data.article.title,owners:data.article.owners.map(o => o.displayName)})
      setVersions(data.article.versions)
      setIsLoading(false)
    })()

    
    console.log("trigger use effect")
  },[])

  return (
    <section className={styles.container}>
      {!isLoading && <WriteLeft article={articleInfos} {...live} versions={versions} />}
      <nav className={styles.right}>
        <section>
          <h1>YamlEditor</h1>
        </section>
      </nav>
  
      <article className={styles.article}>
        {readOnly && <p>ReadOnly</p>}
        Writing {props.id} {props.version}
        {isLoading && <p>Loading...</p>}
        {!isLoading && <>
          <p>{JSON.stringify(versions)}</p>
          <p>{JSON.stringify(live)}</p>
        </>}
      </article>
    </section>
  )
}

const Write = connect(
  mapStateToProps
)(ConnectedWrite)

export default Write