import React from "react"

import App from '../layouts/App'
import Books from '../components/Books'

import '../styles/general.scss'

export default () => {
    const isBrowser = typeof window !== 'undefined';
    return (
    <App layout="wrapped" title="Stylo | Books">
        <section>
            {isBrowser && <Books/>}
        </section>
    </App>
)}