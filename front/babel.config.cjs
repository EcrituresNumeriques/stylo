/* eslint-disable no-undef */
module.exports = {
  presets: [
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
        development: process.env.NODE_ENV === 'development',
        importSource: '@welldone-software/why-did-you-render',
      },
    ],
    [
      '@babel/preset-env',
      {
        corejs: '3.38',
        useBuiltIns: 'entry',
      },
    ],
  ],
}
