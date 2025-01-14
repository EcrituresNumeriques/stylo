import { useMemo } from 'react'
import useSWR from 'swr'
import { toYaml } from '../components/Write/metadata/yaml.js'
import { applicationConfig } from '../stores/applicationConfig.jsx'

const fetcher = (url) => fetch(url).then((response) => response.json())
const postFetcher = ([url, formData]) => {
  const body = new FormData()

  Object.entries(formData).forEach(([key, value]) => body.append(key, value))

  return fetch(url, { method: 'POST', body }).then((response) =>
    response.text()
  )
}

export default function useStyloExport({
  csl: bibliography_style,
  bib: excerpt,
}) {
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

export function useStyloExportPreview({
  md_content,
  bib_content,
  metadata_content,
}) {
  const { pandocExportEndpoint } = applicationConfig
  const yaml_content = useMemo(
    () => toYaml(metadata_content),
    [metadata_content]
  )
  const previewArgs = {
    bibliography_style: 'chicagomodified',
    md_content,
    yaml_content,
    bib_content,
  }

  const { data: html, isLoading } = useSWR(
    [`${pandocExportEndpoint}/api/article_preview`, previewArgs],
    postFetcher,
    { fallbackData: '' }
  )

  return { html, isLoading }
}
