import React from 'react'

import {iconName} from '../helpers/bibtex'
import styles from './ReferenceTypeIcon.scss'


export default ({ type }) => <img src={`/images/bibtex/${iconName(type)}.svg`} className={styles.icon} alt={type} title={type}/>
