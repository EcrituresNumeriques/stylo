import { Card, Divider, Text } from '@geist-ui/core'
import React from 'react'
import { AlertOctagon } from 'lucide-react'

import styles from './ErrorMessageCard.module.scss'

export default function ErrorMessageCard({ title, children }) {
  return (
    <Card>
      <Card.Content className={styles.title}>
        <AlertOctagon />
        <Text b my={0}>
          {title}
        </Text>
      </Card.Content>
      <Divider h="1px" my={0} />
      <Card.Content>{children}</Card.Content>
    </Card>
  )
}
