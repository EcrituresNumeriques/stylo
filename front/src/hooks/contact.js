import { useSelector } from 'react-redux'

import { executeQuery } from '../helpers/graphQL.js'
import { addContact, getContacts, removeContact } from './Contacts.graphql'
import useFetchData from './graphql.js'

export function useContactActions() {
  const sessionToken = useSelector((state) => state.sessionToken)
  const { data, mutate, isLoading, error } = useFetchData(
    { query: getContacts },
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
        contactId,
      },
      sessionToken,
    })
    await mutate(
      {
        user: {
          acquintances: result.addContact.acquintances,
        },
      },
      { revalidate: false }
    )
  }
  const remove = async (contactId) => {
    const result = await executeQuery({
      query: removeContact,
      variables: { contactId },
      sessionToken,
    })
    await mutate(
      {
        user: {
          acquintances: result.removeContact.acquintances,
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
