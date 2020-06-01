module.exports = {
//   lintOnSave: false,
  publicPath: './',
  assetsDir: 'assets',
  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: true,
    }
  },
  transpileDependencies: [
    'quasar'
  ]
}
