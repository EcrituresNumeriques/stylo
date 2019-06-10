import React,{useState,useEffect} from 'react'
import { connect } from "react-redux"

import styles from './acquintances.module.scss'

import askGraphQL from '../helpers/graphQL'
import etv from '../helpers/eventTargetValue'

const mapStateToProps = ({ logedIn, sessionToken, activeUser }) => {
  return { logedIn, sessionToken, activeUser }
}

const ConnectedAcquintances = (props) => {

  const [acquintances, setAcquintances] = useState([])
  const [contact,setContact] = useState('')
  const [loading,setLoading] = useState(true)
  const [action,setAction] = useState("share")

  const addContact = async (e) => {
    e.preventDefault();
    const query = `mutation($user:ID!,$email:String!){addAcquintance(email:$email,user:$user){ _id }}`
    const variables = {user:props.activeUser._id,email:contact}
    await askGraphQL({query,variables}, 'Adding acquintances',props.sessionToken)
    setContact('')
    setLoading(true)
  }

  const shareWith = async (to) => {
    try{
      const query = `mutation($user:ID!,$article:ID!,$to:ID!){${action}Article(article:$article,to:$to,user:$user){ _id }}`
      const variables = {user:props.activeUser._id,to:to,article:props._id}
      await askGraphQL({query,variables}, 'Sharing Article',props.sessionToken)
      props.setNeedReload()
      props.cancel()
    }
    catch(err){
      alert(err)
    }
  }

  useEffect(()=>{
    if(loading){
      (async () =>{
        const query = `query($user:ID!){user(user:$user){ acquintances{ _id displayName email } } }`
        const variables = {user:props.activeUser._id}
        const data = await askGraphQL({query,variables}, 'Fetching acquintances',props.sessionToken)
        setLoading(false)
        setAcquintances(data.user.acquintances)
      })()
    }
  },[loading])

  return (
    <section className={styles.acquintances}>
      <nav><p onClick={()=>setAction("share")}>Share</p><p onClick={()=>setAction("send")}>Send</p></nav>
      <h1>{action} article</h1>
      <form onSubmit={(e)=>addContact(e)}>
        <input type="text" placeholder="Email of the contact you want to add" value={contact} onChange={(e)=>setContact(etv(e))} />
        <button>Add</button>
      </form>
      {loading && <p>Loading...</p>}
      {!loading && acquintances.length === 0 && <p>No acquintances</p>}
  {acquintances.map((a,i)=>(<p key={`acquintance-${a._id}`}><span onClick={()=>shareWith(a._id)}>{action}</span>{a.displayName}<br/>({a.email})</p>))}
    </section>
  )
}



const Acquintances = connect(
  mapStateToProps
)(ConnectedAcquintances)


export default Acquintances