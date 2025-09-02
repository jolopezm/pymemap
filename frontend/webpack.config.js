const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Habilitar hot module replacement
  if (env.mode === 'development') {
    config.devServer = {
      ...config.devServer,
      hot: true,
      liveReload: true,
      watchFiles: ['src/**/*', 'App.js', '*.js', '*.jsx', '*.ts', '*.tsx'],
    };
  }
  
  return config;
};
