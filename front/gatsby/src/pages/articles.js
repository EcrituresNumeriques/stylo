import React from "react"

import App from '../layouts/App'
import Articles from '../components/Articles'

import '../styles/general.scss'

export default () => {
    const isBrowser = typeof window !== 'undefined';
    return (
    <App title="Stylo | Articles" layout="wrapped">
        <section>
            {isBrowser && <Articles/>}
        </section>
    </App>
)}