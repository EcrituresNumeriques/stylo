import React from 'react'
import Button from './Button.jsx'
import { Send, UserMinus } from 'react-feather'

import styles from './articles.module.scss'
import clsx from 'clsx'

export default function ContributorItem ({ name, email }) {


  return (
    <li className={clsx(styles.contributor)}>
      <div className={styles.contributorInfo}>
        <div className={styles.contributorName}>{name}</div>
        <div className={styles.contributorEmail}><a href={email}>{email}</a></div>
      </div>
      <div className={styles.contributorActions}>
        {/*<Button icon={true} small={true}>*/}
        {/*  <Send/> Envoyer une copie*/}
        {/*</Button>*/}
        <Button className={styles.contributorRevoke} icon={true} small={true} title={'Révoquer l\'accès'}>
          <UserMinus/> Révoquer l'accès
        </Button>
      </div>
    </li>
  )
}
