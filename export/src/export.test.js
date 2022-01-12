/* eslint-env mocha */
'use strict'

const { _createBookExportContext: createBookExportContext } = require('../src/export')

test('should create a book export context', () => {
  const bookExportContext = createBookExportContext([
    {
      title: 'Poem: "All in the golden afternoon"',
      versions: [],
      workingVersion: {
        bib: 'Bibliography of the poem, working version',
        md: 'Content of the poem, working version',
      }
    },
    {
      title: 'Chapter 1: Down the Rabbit-Hole',
      versions: [
        {
          bib: 'Bibliography of chapter 1, first version',
          md: 'Content of chapter 1, first version',
          yaml: 'metadata: "Metadata of chapter 1, first version"'
        },
      ],
      workingVersion: {
        bib: 'Bibliography of chapter 1, working version',
        md: 'Content of chapter 1, working version',
        yaml: 'metadata: "Metadata of chapter 1, working version"'
      }
    },
    {
      title: 'Chapter 2: The Pool of Tears',
      versions: [
        {
          bib: 'Bibliography of chapter 2, first version',
          md: 'Content of chapter 2, first version',
        },
        {
          bib: 'Bibliography of chapter 2, second version',
          md: 'Content of chapter 2, second version',
        }
      ],
      workingVersion: {
        bib: 'Bibliography of chapter 2, working version',
        md: 'Content of chapter 2, working version',
      }
    },
    {
      title: 'Chapter 3: A Caucus-Race and a long Tale',
      versions: [],
      workingVersion: {
        bib: 'Bibliography of chapter 3, working version',
        md: 'Content of chapter 3, working version',
      }
    },
  ], { id: '1234', title: 'Alice\'s Adventures in Wonderland' })
  expect(bookExportContext).toStrictEqual({
    bib: 'Bibliography of chapter 1, first version\nBibliography of chapter 2, second version\nBibliography of chapter 3, working version\nBibliography of the poem, working version',
    md: 'Content of chapter 1, first version\n\nContent of chapter 2, second version\n\nContent of chapter 3, working version\n\nContent of the poem, working version',
    yaml: 'metadata: "Metadata of chapter 1, first version"',
    id: '1234',
    title: 'Alice\'s Adventures in Wonderland'
  })
})
