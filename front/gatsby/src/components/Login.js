import React, {useState, useRef, useEffect} from "react"
import { Link, navigate } from "gatsby"
import { connect } from "react-redux"

import etv from '../helpers/eventTargetValue'
import askGraphQL from '../helpers/graphQL';
import validateEmail from '../helpers/validationEmail'

import styles from './login.module.scss'

const mapStateToProps = ({ logedIn }) => {
    return { logedIn }
}

const mapDispatchToProps = dispatch => {
    return {
        login: (data) => dispatch({ type: `LOGIN`, login: data }),
        logout: () => dispatch({ type: `LOGOUT` })
    }
}


const ConnectedLogin = (props) => {
    const isBrowser = typeof window !== 'undefined';
    if(isBrowser && props.logedIn){
        navigate('/articles')
    }
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const query = "query($email:String,$username:String,$password:String!){login(username:$username,email:$email,password:$password){token token_cookie password{_id username}users{_id email displayName}}}"
    let user = {email, password}

    const loginUser = async (query,user) => {
        //Validate stuff client-side
        if(user.email === ""){
            alert('Email/username is empty')
            return false
        }
        if(user.password === ""){
            alert('password is empty')
            return false
        }
        if(!validateEmail(user.email)){
            user.username = user.email
            delete user.email
        }


        try{
            const data = await askGraphQL({query,variables:user})
            props.login(data.login)
            //if no error thrown, we can navigate to /login

        }
        catch(err){
            alert(err)
        }
    }
    const usernameRef = useRef()
    useEffect(
        () => {
          console.log("render");
          usernameRef.current.focus();
        },[usernameRef]
      );

    return (
        <section className="disclaimer">
          <p>Looking for technical and editing support? Join the <a href="https://ecrituresnumeriques.ca/en/2019/10/25/Stylo-technical-and-editing-support" target="_blank">weekly session</a> for Stylo users.</p>
        </section>
        <section className={styles.box}>
            <form onSubmit={(event)=>{event.preventDefault();loginUser(query,user)}}>
                <h1>Login</h1>
                <input type="text" placeholder="email or username" ref={usernameRef} value={email} onChange={(e)=>setEmail(etv(e))}/>
                <input type="password" placeholder="password" value={password} onChange={(e)=>setPassword(etv(e))}/>
                <input type="submit" value="go"/>
                <p className="note">or <Link to="/register">create an account</Link></p>
            </form>
        </section>
    )
}

const Login = connect(
    mapStateToProps,
    mapDispatchToProps
)(ConnectedLogin)
export default Login
