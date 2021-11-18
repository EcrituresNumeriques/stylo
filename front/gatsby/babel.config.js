import { env } from 'process'

export default {
  "presets": [
    ['@babel/preset-react', {
      runtime: 'automatic',
      development: env.NODE_ENV === 'development',
      importSource: '@welldone-software/why-did-you-render',
    }],
    [
      '@babel/preset-env', {
        corejs: "3.8",
        useBuiltIns: "entry"
      }
    ]
  ]
}
