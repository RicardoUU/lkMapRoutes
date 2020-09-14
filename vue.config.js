const path = require('path');
function resolve(dir) {
    return path.join(__dirname, dir)
}
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
  ],
  chainWebpack: config => {
    config.resolve.alias
      .set("@", resolve("src"))
      .set("assets", resolve("src/assets"))
      .set("components", resolve("src/components"))
      .set("imgs", resolve("src/imgs"))
  },
}
