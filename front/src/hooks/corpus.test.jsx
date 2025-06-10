import React from 'react'
import { describe, expect, test } from 'vitest'

import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '../../tests/setup.js'
import { useCorpus, useCorpusActions } from './corpus.js'

import Alert from '../components/molecules/Alert.jsx'
import Loading from '../components/molecules/Loading.jsx'

describe('Corpus', () => {
  test('create', async () => {
    // initial request
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => {
        return new Promise((resolve) =>
          resolve({
            data: {
              corpus: [{ _id: '111', name: 'Corpus #111' }],
            },
          })
        )
      },
    })
    // create corpus request
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => {
        console.log('resolve data')
        return new Promise((resolve) =>
          resolve({
            data: {
              createCorpus: { _id: '222', name: 'Corpus #222' },
            },
          })
        )
      },
    })
    // get corpus request (after creation)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => {
        return new Promise((resolve) =>
          resolve({
            data: {
              corpus: [
                { _id: '111', name: 'Corpus #111' },
                { _id: '222', name: 'Corpus #222' },
              ],
            },
          })
        )
      },
    })
    const Component = () => {
      const { error, isLoading, corpus } = useCorpus({})
      const { createCorpus } = useCorpusActions()

      if (error) {
        return <Alert message={error.message} />
      }

      if (isLoading) {
        return <Loading />
      }

      return (
        <div>
          <button
            data-testid="create-corpus"
            onClick={() =>
              createCorpus({
                title: 'Corpus #222',
                description: '',
              })
            }
          ></button>
          <div>
            {corpus.map((c, index) => (
              <div key={index} data-testid={`corpus-${index}`} role="article">
                {c.name}
              </div>
            ))}
          </div>
        </div>
      )
    }
    renderWithProviders(<Component />)
    const corpus0 = await screen.findByTestId('corpus-0')
    const items = await screen.findAllByRole('article')
    expect(items).toHaveLength(1)
    const createCorpusButton = await screen.findByTestId('create-corpus')
    fireEvent.click(createCorpusButton)
    expect(fetch).toHaveBeenLastCalledWith(
      undefined,
      expect.objectContaining({
        body: expect.stringMatching(/"query":"mutation createCorpus\(/),
      })
    )
    const corpus1 = await screen.findByTestId('corpus-1')
    expect(corpus0).toBeInTheDocument()
    expect(corpus1).toBeInTheDocument()
    const itemsAfter = await screen.findAllByRole('article')
    expect(itemsAfter).toHaveLength(2)
  })
})
