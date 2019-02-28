import React from "react"

import Wrapped from '../layouts/Wrapped'

import '../styles/general.scss'

export default () => {
    const isBrowser = typeof window !== 'undefined';
    return (
    <Wrapped title="Stylo | My Profile">
        <section>
            {isBrowser && <p>Profile management</p>}
        </section>
    </Wrapped>
)}