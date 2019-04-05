import React from "react"

import Wrapped from '../layouts/Wrapped'
import Credentials from '../components/Credentials'

import '../styles/general.scss'

export default () => {
    const isBrowser = typeof window !== 'undefined';
    return (
    <Wrapped title="Stylo | My Credentials">
        <section>
            {isBrowser && <Credentials />}
        </section>
    </Wrapped>
)}