const { normalize } = require('./filename')

test('normalize "La Recette de la Crème Brûlée"', () => {
  expect(normalize('La Recette de la Crème Brûlée')).toBe(
    'La_Recette_de_la_Creme_Brulee'
  )
})
