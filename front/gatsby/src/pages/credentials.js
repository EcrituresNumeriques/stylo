import React from "react"

import App from '../layouts/App'
import Credentials from '../components/Credentials'

import '../styles/general.scss'

export default () => {
    const isBrowser = typeof window !== 'undefined';
    return (
    <App layout="wrapped" title="Stylo | My Credentials">
        <section>
            {isBrowser && <Credentials />}
        </section>
    </App>
)}