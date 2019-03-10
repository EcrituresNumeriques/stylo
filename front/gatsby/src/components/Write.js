import React, {useEffect,useState,useRef} from 'react'
import { connect } from 'react-redux'
import { navigate } from 'gatsby'

import askGraphQL from '../helpers/graphQL';
import styles from './write.module.scss'

import WriteLeft from './Write/WriteLeft'
import WriteRight from './Write/WriteRight'

import useDebounce from '../hooks/debounce'

import _ from 'lodash'

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
  const query = "query($article:ID!){article(article:$article){ _id title zoteroLink owners{ displayName } versions{ _id version revision message autosave updatedAt } "
  const getLive = "live{ md sommaire bib yaml message} } }"
  const getVersion = `} version(version:"${props.version}"){ _id md sommaire bib yaml message revision version } }`

  const fullQuery = props.version?query + getVersion:query + getLive

  let instanceCM = useRef(null);

  const setCodeMirrorCursor = (line) => {
    try{
      const editor = instanceCM.current.editor
      editor.focus();
      editor.execCommand('goDocEnd')
      editor.setCursor(line,0)
      editor.execCommand('goLineEnd')
    }
    catch(err){
      console.log('too fast, editor not mounted yet')
    }
    


    //instanceCM.focus();
    //instanceCM.setCursor(line,0);
  } 

  const variables = {user:props.users[0]._id,article:props.id}
  const [isLoading,setIsLoading] = useState(true)
  const [live, setLive] = useState({})
  const [versions, setVersions] = useState([])
  const [articleInfos, setArticleInfos] = useState({title:"",owners:[],zoteroLink:""})
  
  
  
  const sendVersion = async (autosave = true,major = false, message = "") => {
    try{
      const query = `mutation($user:ID!,$article:ID!,$md:String!,$bib:String!,$yaml:String!,$autosave:Boolean!,$major:Boolean!,$message:String){saveVersion(version:{article:$article,major:$major,auto:$autosave,md:$md,yaml:$yaml,bib:$bib,message:$message},user:$user){ _id version revision message autosave updatedAt } }`
      const response = await askGraphQL({query,variables:{...variables,...live,autosave,major,message}},'saving new version',props.sessionToken)
      if(!autosave || versions[0]._id !== response.saveVersion._id){
        setVersions([response.saveVersion,...versions])
      }
      else{
        //Last version had same _id, we gucchi to update!
        const immutableV = [...versions]
        const [_,...rest] = immutableV
        setVersions([response.saveVersion,...rest])
      }
      return response
    }
    catch(err){
      alert(err)
    }
  }
  


  //Autosave debouncing on the live
  // TODO: Do not save when opening
  const debouncedLive = useDebounce(live, 1000);
  useEffect(()=>{
    if(!readOnly && !isLoading){
      sendVersion(true,false, "Autosave")
    }
  },[debouncedLive])
  
  
  const handleMDCM = async (___, __, md)=>{
    await setLive({...live,md:md})
  }
  const handleYaml = async (yaml) => {
    await setLive({...live,yaml:yaml})
  }
  const handleBib = async (bib) => {
    await setLive({...live,bib:bib})
  }
  
  //Reload when version switching
  useEffect(()=>{
    (async () => {
      setIsLoading(true)
      const data = await askGraphQL({query:fullQuery,variables},'fetching Live version',props.sessionToken)
      setLive(props.version?data.version:data.article.live)
      setArticleInfos({_id:data.article._id,title:data.article.title,zoteroLink:data.article.zoteroLink,owners:data.article.owners.map(o => o.displayName)})
      setVersions(data.article.versions)
      setIsLoading(false)
    })()
  },[props.version])

  return (
    <section className={styles.container}>
      {!isLoading && <WriteLeft article={articleInfos} {...live} versions={versions} readOnly={readOnly} sendVersion={sendVersion} handleBib={handleBib} setCodeMirrorCursor={setCodeMirrorCursor} />}
      {!isLoading && <WriteRight {...live} handleYaml={handleYaml} readOnly={readOnly}/>}
  
      <article className={styles.article}>
        {isLoading && <p>Loading...</p>}
        {!isLoading && <>
          {readOnly && <pre>{live.md}</pre>}
          {!readOnly && <CodeMirror value={live.md} onBeforeChange={handleMDCM} options={{mode:'markdown',lineWrapping:true,viewportMargin:Infinity,autofocus:true,spellcheck:true,extraKeys:{"Shift-Ctrl-Space": function(cm) {cm.replaceSelection("\u00a0");}}}} ref={instanceCM}/>}
        </>}
      </article>
    </section>
  )
}

const Write = connect(
  mapStateToProps
)(ConnectedWrite)

export default Write