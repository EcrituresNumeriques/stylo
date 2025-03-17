import { useSelector } from 'react-redux'
import { executeQuery } from '../helpers/graphQL.js'
import {
  addContributor as addContributorQuery,
  removeContributor as removeContributorQuery,
} from '../components/ArticleContributors.graphql'
import { getArticleContributors } from '../components/Article.graphql'
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
        contributors: response.article.addContributor.contributors,
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
        contributors: response.article.removeContributor.contributors,
      },
    }))
  }

  return {
    addContributor,
    removeContributor,
  }
}
