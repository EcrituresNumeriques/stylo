import React from 'react'
import { navigate } from 'gatsby'
import { Router, Location } from "@reach/router"
import FullPage from '../layouts/FullPage'
import WriteBook from '../components/WriteBook'

export default () => (
    <Location>
        {({location}) => (
            <Router location={location} className="router">
                <BookEmpty path="/book"/>
                <BookID path="/book/:id/chapter/:chapter"/>
                <BookID path="/book/:id"/>
            </Router>
        )}
    </Location>
)

const isBrowser = typeof window !== 'undefined';
const BookEmpty = () => {
    if(!isBrowser){
        return (<p>not compiling</p>)
    }
    navigate('/books');
    return(
        <p>Bad request, redirecting</p>
    )
}

const BookID = props => {
    if(!isBrowser){
        return (<p>not compiling</p>)
    }
    return (<FullPage>
            <WriteBook {...props}/>
    </FullPage>)
}