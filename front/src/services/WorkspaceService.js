import { create, leave } from './WorkspaceService.graphql'
import {runQuery} from '../helpers/graphQL.js'

export default class WorkspaceService {
  constructor (sessionToken, applicationConfig) {
    this.sessionToken = sessionToken
    this.graphqlEndpoint = applicationConfig.graphqlEndpoint
  }

  async create (data) {
    const { sessionToken, graphqlEndpoint } = this

    return runQuery({ sessionToken, graphqlEndpoint }, {
      query: create,
      variables: {
        data
      }
    })
  }

  async leave (workspaceId) {
    const { sessionToken, graphqlEndpoint } = this

    return runQuery({ sessionToken, graphqlEndpoint }, {
      query: leave,
      variables: {
        workspaceId
      }
    })
  }
}
