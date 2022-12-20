import useSWR from 'swr'
import { useSelector } from 'react-redux'

const fetcher = (url) => fetch(url).then(response => response.json())
const postFetcher = ([url, formData]) => {
  const body = new FormData()

  Object.entries(formData).forEach(([key, value]) => body.append(key, value))

  return fetch(url, { method: 'POST', body })
    .then(response => response.text())
}

const bib = `@book{goody_raison_1979,
series = {Le sens commun},
title = {La {Raison} graphique. {La} domestication de la pensée sauvage.},
publisher = {Les Editions de Minuit},
author = {Goody, Jack},
year = {1979},
}`

export default function useStyloExport (bibStyle) {
  const pandocExportEndpoint = useSelector(state => state.applicationConfig.pandocExportEndpoint)

  const { data: exportFormats } = useSWR(`${pandocExportEndpoint}/api/available_exports`, fetcher, { fallbackData: [] })
  const { data: exportStyles } = useSWR(`${pandocExportEndpoint}/api/available_bibliographic_styles`, fetcher, { fallbackData: [] })
  const { data: exportStylesPreview, isLoading } = useSWR([`${pandocExportEndpoint}/api/bibliography_preview`, { excerpt: bib , name: bibStyle}], postFetcher, { fallbackData: '' })

  return { exportFormats, exportStyles, exportStylesPreview, isLoading }
}
