module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  plugins: [
    '@snowpack/plugin-sass',
    '@snowpack/plugin-react-refresh'
  ],
  devOptions: {
    port: 3000,
  },
}
