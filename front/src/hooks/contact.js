import useFetchData from './graphql.js'
import { useSelector } from 'react-redux'

import {
  addContact,
  removeContact,
  getContacts,
} from '../components/Contacts.graphql'
import { executeQuery } from '../helpers/graphQL.js'

export function useContactActions() {
  const activeUser = useSelector((state) => state.activeUser)
  const sessionToken = useSelector((state) => state.sessionToken)
  const activeUserId = activeUser._id
  const { data, mutate, isLoading, error } = useFetchData(
    { query: getContacts, variables: { userId: activeUserId } },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const add = async (contactId) => {
    const result = await executeQuery({
      query: addContact,
      variables: {
        userId: activeUserId,
        contactId,
      },
      sessionToken,
      type: 'mutation',
    })
    await mutate(
      {
        user: {
          acquintances: result.user.addContact.acquintances,
        },
      },
      { revalidate: false }
    )
  }
  const remove = async (contactId) => {
    const result = await executeQuery({
      query: removeContact,
      variables: { userId: activeUserId, contactId },
      sessionToken,
      type: 'mutation',
    })
    await mutate(
      {
        user: {
          acquintances: result.user.removeContact.acquintances,
        },
      },
      { revalidate: false }
    )
  }

  return {
    contacts: data?.user?.acquintances || [],
    isLoading,
    error,
    add,
    remove,
  }
}
