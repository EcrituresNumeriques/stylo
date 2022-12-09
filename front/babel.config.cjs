/* eslint-disable no-undef */
module.exports = {
  "presets": [
    ['@babel/preset-react', {
      runtime: 'automatic',
      development: process.env.NODE_ENV === 'development',
      importSource: process.env.NODE_ENV !== 'test' ? '@welldone-software/why-did-you-render' : 'react',
    }],
    [
      '@babel/preset-env', {
        corejs: "3.21",
        useBuiltIns: "entry"
      }
    ]
  ]
}
