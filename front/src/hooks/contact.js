import { executeQuery } from '../helpers/graphQL.js'
import { addContact, getContacts, removeContact } from './Contacts.graphql'
import useFetchData from './graphql.js'

export function useContactActions() {
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
    })
    await mutate(
      {
        user: {
          contacts: result.addContact.contacts,
        },
      },
      { revalidate: false }
    )
  }
  const remove = async (contactId) => {
    const result = await executeQuery({
      query: removeContact,
      variables: { contactId },
    })
    await mutate(
      {
        user: {
          contacts: result.removeContact.contacts,
        },
      },
      { revalidate: false }
    )
  }

  return {
    contacts: data?.user?.contacts || [],
    isLoading,
    error,
    add,
    remove,
  }
}
