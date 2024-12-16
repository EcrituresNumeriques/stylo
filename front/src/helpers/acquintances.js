export function merge(...lists) {
  return (
    lists
      .flat()
      .map((entry) => entry.user ?? entry)
      // we keep users who do not appear further in the array
      .filter((user, index, allUsers) => {
        return (
          allUsers.slice(index + 1).some(({ _id }) => _id === user._id) ===
          false
        )
      })
  )
}
