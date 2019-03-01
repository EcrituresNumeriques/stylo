import React, {useEffect,useState} from 'react'
import { connect } from 'react-redux'
import { navigate } from 'gatsby'

import askGraphQL from '../helpers/graphQL';
import styles from './write.module.scss'

import WriteLeft from './Write/WriteLeft'
import WriteRight from './Write/WriteRight'

let CodeMirror = () => (<p>No window</p>)
if (typeof window !== `undefined` && typeof navigator !== `undefined`) {
  const {Controlled} = require("react-codemirror2")
  require('codemirror/mode/markdown/markdown');
  CodeMirror = Controlled
}

const mapStateToProps = ({ logedIn, sessionToken, users }) => {
  return { logedIn, sessionToken, users  }
}

const ConnectedWrite = (props) => {
  if(!props.logedIn){
    navigate('/login')
    return (<p>Redirecting...</p>)
  }
  const readOnly = props.version? true:false;
  const query = "query($article:ID!){article(article:$article){ _id title owners{ displayName } versions{ _id version revision message autosave } "
  const getLive = "live{ md sommaire bib yaml message} } }"
  const getVersion = `} version(version:"${props.version}"){ md sommaire bib yaml message } }`

  const fullQuery = props.version?query + getVersion:query + getLive

  let instanceCM = null;

  
  const variables = {user:props.users[0]._id,article:props.id}
  const [isLoading,setIsLoading] = useState(true)
  const [live, setLive] = useState({})
  const [versions, setVersions] = useState([])
  const [articleInfos, setArticleInfos] = useState({title:"",owners:[]})
  
  const handleMDCM = (_, __, md)=>{
    setLive({...live,md:md})
  }
  useEffect(()=>{
    (async () => {
      setIsLoading(true)
      const data = await askGraphQL({query:fullQuery,variables},'fetching Live version',props.sessionToken)
      setLive(props.version?data.version:data.article.live)
      setArticleInfos({_id:data.article._id,title:data.article.title,owners:data.article.owners.map(o => o.displayName)})
      setVersions(data.article.versions)
      setIsLoading(false)
    })()

    
    console.log("trigger use effect")
  },[props.version])

  return (
    <section className={styles.container}>
      {!isLoading && <WriteLeft article={articleInfos} {...live} versions={versions} readOnly={readOnly}/>}
      {!isLoading && <WriteRight {...live} readOnly={readOnly}/>}
  
      <article className={styles.article}>
        {isLoading && <p>Loading...</p>}
        {!isLoading && <>
          {readOnly && <pre>{live.md}</pre>}
          {!readOnly && <CodeMirror value={live.md} onBeforeChange={handleMDCM} options={{mode:'markdown',lineWrapping:true,viewportMargin:Infinity,autofocus:true,spellcheck:true,extraKeys:{"Shift-Ctrl-Space": function(cm) {cm.replaceSelection("\u00a0");}}}} editorDidMount={editor => { instanceCM = editor }}/>}
        </>}
      </article>
    </section>
  )
}

const Write = connect(
  mapStateToProps
)(ConnectedWrite)

export default Write