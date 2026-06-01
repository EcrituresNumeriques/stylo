import { useSelector } from 'react-redux'

import { executeQuery } from '../helpers/graphQL.js'
import { getArticleContributors } from './Article.graphql'
import {
  addArticleContributor as addContributorQuery,
  removeArticleContributor as removeContributorQuery,
} from './ArticleContributors.graphql'
import { useMutateData } from './graphql.js'

export function useArticleContributorActions({ articleId }) {
  const { mutate } = useMutateData({
    query: getArticleContributors,
    variables: { articleId },
  })
  const sessionToken = useSelector((state) => state.sessionToken)
  const addContributor = async (contributorId) => {
    const response = await executeQuery({
      sessionToken,
      query: addContributorQuery,
      variables: { userId: contributorId, articleId },
    })
    await mutate(async () => ({
      article: {
        contributors: response.addArticleContributor.contributors,
      },
    }))
  }

  const removeContributor = async (contributorId) => {
    const response = await executeQuery({
      sessionToken,
      query: removeContributorQuery,
      variables: { userId: contributorId, articleId },
    })
    await mutate(async () => ({
      article: {
        contributors: response.removeArticleContributor.contributors,
      },
    }))
  }

  return {
    addContributor,
    removeContributor,
  }
}
