import React from "react"

import Wrapped from '../layouts/Wrapped'
import Articles from '../components/Articles'

import '../styles/general.scss'

export default () => (
    <Wrapped title="Hello Stylo">
        <section>
            <Articles/>
        </section>
    </Wrapped>
)