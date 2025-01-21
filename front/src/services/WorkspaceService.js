import { create, leave } from './WorkspaceService.graphql'
import { runQuery } from '../helpers/graphQL.js'

export default class WorkspaceService {
  constructor(sessionToken) {
    this.sessionToken = sessionToken
  }

  async create(data) {
    const { sessionToken } = this

    return runQuery(
      { sessionToken },
      {
        query: create,
        variables: {
          data,
        },
      }
    )
  }

  async leave(workspaceId) {
    const { sessionToken } = this

    return runQuery(
      { sessionToken },
      {
        query: leave,
        variables: {
          workspaceId,
        },
      }
    )
  }
}
