import React,{useState,useEffect} from 'react'
import { connect } from "react-redux"

import askGraphQL from '../helpers/graphQL'
import etv from '../helpers/eventTargetValue'

const mapStateToProps = ({ logedIn, sessionToken, users }) => {
  return { logedIn, sessionToken, users }
}

const ConnectedAcquintances = (props) => {

  const [acquintances, setAcquintances] = useState([])
  const [contact,setContact] = useState('')
  const [loading,setLoading] = useState(true)

  const addContact = async (e) => {
    e.preventDefault();
    const query = `mutation($user:ID!,$email:String!){addAcquintance(email:$email,user:$user){ _id }}`
    const variables = {user:props.users[0]._id,email:contact}
    await askGraphQL({query,variables}, 'Adding acquintances',props.sessionToken)
    setContact('')
    setLoading(true)
  }

  const shareWith = async (to) => {
    try{

      const query = `mutation($user:ID!,$article:ID!,$to:ID!){shareArticle(article:$article,to:$to,user:$user){ _id }}`
      const variables = {user:props.users[0]._id,to:to,article:props._id}
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
        const variables = {user:props.users[0]._id}
        const data = await askGraphQL({query,variables}, 'Fetching acquintances',props.sessionToken)
        setLoading(false)
        setAcquintances(data.user.acquintances)
      })()
    }
  },[loading])

  return (
    <>
      <h1>{props.action} article</h1>
      <form onSubmit={(e)=>addContact(e)}>
        <label>Add a contact</label>
        <input type="text" value={contact} onChange={(e)=>setContact(etv(e))} />
        <button>Add</button>
      </form>
      {loading && <p>Loading...</p>}
      {!loading && acquintances.length === 0 && <p>No acquintances</p>}
  {acquintances.map((a,i)=>(<p key={`acquintance-${a._id}`}>{a.displayName} ({a.email})<span onClick={()=>shareWith(a._id)}>share</span></p>))}
    </>
  )
}



const Acquintances = connect(
  mapStateToProps
)(ConnectedAcquintances)


export default Acquintances