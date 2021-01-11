module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  plugins: ['@snowpack/plugin-dotenv', '@snowpack/plugin-sass'],
  devOptions: {
    port: 3000,
  },
}
