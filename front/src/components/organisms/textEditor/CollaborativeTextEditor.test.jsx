import { screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { renderWithProviders } from '../../../../tests/setup.js'
import { useArticleVersion } from '../../../hooks/article.js'
import CollaborativeTextEditor from './CollaborativeTextEditor.jsx'

vi.mock('../../../hooks/article.js', () => ({
  useArticleVersion: vi.fn(),
  useArticleMetadata: () => ({ metadata: {} }),
  useEditableArticle: () => ({
    article: { title: 'Article', workingVersion: { md: '' } },
    bibliography: null,
    isLoading: false,
  }),
}))
vi.mock('../../../hooks/collaboration.js', () => ({
  useCollaboration: () => ({
    yText: {
      toString: () => '# Working copy',
      observe: vi.fn(),
      unobserve: vi.fn(),
    },
    awareness: {},
    websocketStatus: 'connected',
    isSynced: true,
    dynamicStyles: '',
  }),
}))
vi.mock('../../../hooks/stylo-export.js', () => ({
  useStyloExportPreview: () => ({ html: '', isLoading: false }),
}))
vi.mock('./CollaborativeEditorArticleHeader.jsx', () => ({
  default: () => null,
}))
vi.mock('../../molecules/MonacoEditor.jsx', () => ({
  default: () => null,
  MonacoDiffEditor: ({ original, modified, options }) => (
    <pre data-testid="diff" data-read-only={options.readOnly}>
      {original} → {modified}
    </pre>
  ),
}))

describe('CollaborativeTextEditor', () => {
  test('computes the stats and the structure of a version once it is received', async () => {
    const onStatsChange = vi.fn()
    const onStructureChange = vi.fn()
    // until the server answers, the version is empty
    useArticleVersion.mockReturnValue({ version: {}, isLoading: false })

    const props = {
      articleId: 'a1',
      versionId: 'v1',
      mode: 'write',
      onStatsChange,
      onStructureChange,
    }
    const { rerender } = renderWithProviders(
      <CollaborativeTextEditor {...props} />
    )
    await waitFor(() => expect(useArticleVersion).toHaveBeenCalled())
    expect(onStatsChange).not.toHaveBeenCalled()
    expect(onStructureChange).not.toHaveBeenCalled()

    useArticleVersion.mockReturnValue({
      version: { md: '# Title' },
      isLoading: false,
    })
    rerender(<CollaborativeTextEditor {...props} />)

    await waitFor(() => expect(onStatsChange).toHaveBeenCalledWith('# Title'))
    expect(onStructureChange).toHaveBeenCalledWith('# Title')
  })

  test('ignores the working copy on a version', async () => {
    const onStructureChange = vi.fn()
    useArticleVersion.mockReturnValue({
      version: { md: '# Version' },
      isLoading: false,
    })

    renderWithProviders(
      <CollaborativeTextEditor
        articleId="a1"
        versionId="v1"
        mode="write"
        onStructureChange={onStructureChange}
      />
    )
    await waitFor(() =>
      expect(onStructureChange).toHaveBeenCalledWith('# Version')
    )
    // the working copy updates are throttled
    await new Promise((resolve) => setTimeout(resolve, 300))

    expect(onStructureChange).not.toHaveBeenCalledWith('# Working copy')
  })

  test('follows the working copy without a version', async () => {
    const onStructureChange = vi.fn()
    useArticleVersion.mockReturnValue({ version: {}, isLoading: false })

    renderWithProviders(
      <CollaborativeTextEditor
        articleId="a1"
        mode="write"
        onStructureChange={onStructureChange}
      />
    )

    await waitFor(() =>
      expect(onStructureChange).toHaveBeenCalledWith('# Working copy')
    )
  })

  test('compares the version with the shared working copy, read only', async () => {
    useArticleVersion.mockReturnValue({
      version: { md: '# Version' },
      isLoading: false,
    })

    renderWithProviders(
      <CollaborativeTextEditor articleId="a1" versionId="v1" mode="compare" />
    )

    const diff = await screen.findByTestId('diff')
    // not the working copy saved in the database (empty here)
    await waitFor(() =>
      expect(diff).toHaveTextContent('# Version → # Working copy')
    )
    expect(diff).toHaveAttribute('data-read-only', 'true')
  })
})
