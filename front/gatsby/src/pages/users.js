import React from "react"

import Wrapped from '../layouts/Wrapped'
import User from '../components/User'

import '../styles/general.scss'

export default () => {
    const isBrowser = typeof window !== 'undefined';
    return (
    <Wrapped title="Stylo | Users management">
        <section>
            {isBrowser && <User />}
        </section>
    </Wrapped>
)}