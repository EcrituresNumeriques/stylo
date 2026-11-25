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
  const addContributor = async (contributorId) => {
    const response = await executeQuery({
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
