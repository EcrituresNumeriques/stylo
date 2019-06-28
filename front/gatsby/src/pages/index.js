import React from "react"
import { connect } from "react-redux"
import {navigate} from "gatsby"

import Centered from '../layouts/Centered'

import '../styles/general.scss'

const mapStateToProps = ({ logedIn, password, activeUser }) => {
    return { logedIn, password, activeUser }
}

const ConnectedIndex = (props) => {
    const isBrowser = typeof window !== 'undefined';
    if(isBrowser){
        if(props.logedIn){
            navigate('/articles')
        }
        else{
            navigate('/login')
        }
    }
    return (
        <Centered><p>Redirecting</p></Centered>
    )

    // return (
    //     <Centered title="Hello Stylo">
    //         <h1>Hello World!</h1>
    //         <h2>hello </h2>
    //         <p>
    //             <a href="http://stylo-doc.ecrituresnumeriques.ca/" target="_blank" rel="noopener noreferrer">Documentation</a><br/>
    //             <a href="https://github.com/EcrituresNumeriques/stylo/issues" target="_blank" rel="noopener noreferrer">Report an issue</a>
    //         </p>                    
    //     </Centered>
    //     )
}

const Index = connect(
    mapStateToProps
)(ConnectedIndex)
export default Index