const path = require('path');
function resolve(dir) {
    return path.join(__dirname, dir)
}
module.exports = {
  lintOnSave: true,
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

    
    config.optimization.minimizer('terser').tap((args) => {
        const compress = args[0].terserOptions.compress;
        // 非 App 平台移除 console 代码(包含所有 console 方法，如 log,debug,info...)
        compress.drop_console = true;
        return args;
    });
  },
}
