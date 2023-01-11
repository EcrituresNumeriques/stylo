import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { AlertTriangle, UserMinus, UserPlus } from 'react-feather';

import styles from './credentials.module.scss'
import acquintancesStyles from './Share.module.scss'
import Button from "./Button";

import AcquintanceAddForm from './AcquintanceAddForm'
import { useGraphQL } from '../helpers/graphQL';
import * as queries from './Acquintances.graphql'

export default function CredentialsAccountSharing () {
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState([])
  const [acquintances, setAcquintances] = useState([])
  const activeUserId = useSelector(state => state.activeUser._id)
  const runQuery = useGraphQL()

  const userPermissionsIds = permissions.filter(p => p.scope === 'user').map(({ user }) => user._id)

  useEffect(() => {
    if (loading) {
      runQuery({ query: queries.getAcquintancesPermissions, variables: { user: activeUserId } }).then(({ user }) => {
        setLoading(false)
        setPermissions(user.permissions)
        setAcquintances(user.acquintances)
      })
    }
  }, [loading])

  const giveAccountAccess = useCallback(async ({ from, to }) => {
    const data = await runQuery({
      query: queries.grantAccountAccess,
      variables: { user: activeUserId, from, to }
    })
    setPermissions(data.grantAccountAccess.permissions)
    setAcquintances(data.grantAccountAccess.acquintances)
  }, [])

  const revokeAccountAccess = useCallback(async ({ from, to }) => {
    const data = await runQuery({
      query: queries.revokeAccountAccess,
      variables: { user: activeUserId, from, to }
    })
    setPermissions(data.revokeAccountAccess.permissions)
    setAcquintances(data.revokeAccountAccess.acquintances)
  }, [])

  const refreshContacts = useCallback((acquintances) => setAcquintances(acquintances), [])

  return <section className={styles.section}>
    <h2>Grant Access</h2>

    <p>
      <strong>Share your <em>articles</em> with Stylo contacts you trust</strong>.
    </p>

    <p className={styles.warningMessage}>
      <AlertTriangle color="orange" />
      <span>
        Granted users will <strong>see all</strong> your articles, granting them the ability to <strong>modify</strong> them.
        It applies to all future articles you will create as well.
      </span>
    </p>

    <AcquintanceAddForm onAdd={refreshContacts} />

    <ul>
      {acquintances.map(acquintance => <li key={acquintance._id} className={acquintancesStyles.acquintance}>
        <div>
          <span>{acquintance.displayName}</span>
          <a href={"mailto:" + acquintance.email} className={acquintancesStyles.acquintanceEmail}>
            {acquintance.email}
          </a>
        </div>

        {!userPermissionsIds.includes(acquintance._id) && <div className={acquintancesStyles.acquintanceActions}>
          <Button onClick={() => giveAccountAccess({ from: activeUserId, to: acquintance._id })}>
            <UserPlus /> Give full access
          </Button>
        </div>}

        {userPermissionsIds.includes(acquintance._id) && <div className={acquintancesStyles.acquintanceActions}>
          <Button onClick={() => revokeAccountAccess({ from: activeUserId, to: acquintance._id })}>
            <UserMinus /> Revoke access
          </Button>
        </div>}
      </li>)}
    </ul>
  </section>
}
