import useSWR from 'swr'
import { applicationConfig } from '../config.js'

const fetcher = (url) => fetch(url).then((response) => response.json())

function postFetcher([url, formData]) {
  const body = new FormData()

  Object.entries(formData).forEach(([key, value]) => body.append(key, value))

  return fetch(url, { method: 'POST', body }).then((response) =>
    response.text()
  )
}

export default function useStyloExport({ bibliography_style, bib: excerpt }) {
  const { pandocExportEndpoint } = applicationConfig

  const { data: exportFormats } = useSWR(
    `${pandocExportEndpoint}/api/available_exports`,
    fetcher,
    { fallbackData: [] }
  )
  const { data: exportStyles } = useSWR(
    `${pandocExportEndpoint}/api/available_bibliographic_styles`,
    fetcher,
    { fallbackData: [] }
  )
  const { data: exportStylesPreview, isLoading } = useSWR(
    [
      `${pandocExportEndpoint}/api/bibliography_preview`,
      { excerpt, bibliography_style },
    ],
    postFetcher,
    { fallbackData: '' }
  )

  return {
    exportFormats,
    exportStyles: exportStyles.map(({ title: name, name: key }) => ({
      key,
      name,
    })),
    exportStylesPreview,
    isLoading,
  }
}

/**
 *
 * @param {{
 *   md_content: string,
 *   bib_content: string,
 *   yaml_content: string,
 *   with_toc?: boolean,
 *   with_nocite?: boolean,
 *   with_link_citations?: boolean
 * }} StyloExportPreviewParams
 * @returns {Promise<{ html: string, isLoading: boolean }>}
 */
export function useStyloExportPreview({
  md_content,
  bib_content,
  yaml_content,
  with_toc = false,
  with_nocite = false,
  with_link_citations = false,
}) {
  const { pandocExportEndpoint } = applicationConfig
  const { data: html, isLoading } = useSWR(
    () => {
      // prevent SWR from running the query
      // https://swr.vercel.app/docs/conditional-fetching#dependent
      if (md_content === undefined) {
        throw new Error('Preview parameters are not yet loaded!')
      }
      return [
        `${pandocExportEndpoint}/api/article_preview`,
        {
          bibliography_style: 'chicagomodified',
          md_content,
          yaml_content,
          bib_content,
          with_toc,
          with_nocite,
          with_link_citations,
        },
      ]
    },
    postFetcher,
    { fallbackData: '' }
  )

  return { html, isLoading }
}
