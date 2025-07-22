import { executeQuery } from '../helpers/graphQL.js'
import { useMutateData } from './graphql.js'

import { getArticleContributors } from '../components/Article.graphql'
import {
  addContributor as addContributorQuery,
  removeContributor as removeContributorQuery,
} from '../components/ArticleContributors.graphql'

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
        contributors: response.article.addContributor.contributors,
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
        contributors: response.article.removeContributor.contributors,
      },
    }))
  }

  return {
    addContributor,
    removeContributor,
  }
}
