import React from "react"

import Wrapped from '../layouts/Wrapped'
import Profile from '../components/Profile'

import '../styles/general.scss'

export default () => {
    const isBrowser = typeof window !== 'undefined';
    return (
    <Wrapped title="Stylo | My Profile">
        <section>
            {isBrowser && <Profile />}
        </section>
    </Wrapped>
)}