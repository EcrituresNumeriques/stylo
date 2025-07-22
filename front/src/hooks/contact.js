import { useRouteLoaderData } from 'react-router'

import { executeQuery } from '../helpers/graphQL.js'
import useFetchData from './graphql.js'

import {
  addContact,
  getContacts,
  removeContact,
} from '../components/Contacts.graphql'

export function useContactActions() {
  const { user: activerUser } = useRouteLoaderData('app')
  const { data, mutate, isLoading, error } = useFetchData(
    { query: getContacts, variables: { userId: activerUser._id } },
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
