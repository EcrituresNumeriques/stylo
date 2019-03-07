import React, {useState, useEffect} from 'react'
import {navigate} from 'gatsby'
import { connect } from "react-redux"

import askGraphQL from '../helpers/graphQL';
import styles from './books.module.scss'


const mapStateToProps = ({ logedIn, users, sessionToken }) => {
    return { logedIn, users, sessionToken }
}


const ConnectedBooks = (props) => {
    const isBrowser = typeof window !== 'undefined';
    if(isBrowser && !props.logedIn){
        navigate('/login')
        return <p>redirecting</p>
    }

    const [isLoading,setIsLoading] = useState(true)
    
    return (
        <section className={styles.section}>
        </section>
    )
}

const Books = connect(
    mapStateToProps
)(ConnectedBooks)
export default Books