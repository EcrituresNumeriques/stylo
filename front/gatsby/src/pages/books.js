import React from "react"

import Wrapped from '../layouts/Wrapped'
import Books from '../components/Books'

import '../styles/general.scss'

export default () => {
    const isBrowser = typeof window !== 'undefined';
    return (
    <Wrapped title="Stylo | Books">
        <section>
            {isBrowser && <Books/>}
        </section>
    </Wrapped>
)}