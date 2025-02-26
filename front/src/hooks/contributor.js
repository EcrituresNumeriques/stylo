import { useSelector } from 'react-redux'
import { useSWRConfig } from 'swr'
import { executeQuery } from '../helpers/graphQL.js'
import {
  addContributor as addContributorQuery,
  removeContributor as removeContributorQuery,
} from '../components/ArticleContributors.graphql'
import { getArticleContributors } from '../components/Article.graphql'
import { useSWRKey } from './graphql.js'

export function useArticleContributorActions({ articleId }) {
  const { mutate } = useSWRConfig()
  const key = useSWRKey()({
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
    await mutate(key, async () => ({
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
    await mutate(key, async () => ({
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
