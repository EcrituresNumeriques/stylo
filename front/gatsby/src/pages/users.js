import React from "react"

import Wrapped from '../layouts/Wrapped'

import '../styles/general.scss'

export default () => {
    const isBrowser = typeof window !== 'undefined';
    return (
    <Wrapped title="Stylo | Users management">
        <section>
            {isBrowser && <p>User management</p>}
        </section>
    </Wrapped>
)}