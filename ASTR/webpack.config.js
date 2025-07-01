const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Configuración para PWA
  config.plugins.push(
    new GenerateSW({
      swDest: 'sw.js',
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /^https?.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'offlineCache',
            expiration: {
              maxEntries: 200,
            },
          },
        },
      ],
    })
  );

  // Fallbacks para módulos nativos
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "fs": false,
    "path": false,
    "crypto": false,
    "stream": false,
    "util": false,
    "buffer": false,
    "process": false,
    "os": false,
    "url": false,
    "zlib": false,
    "http": false,
    "https": false,
    "assert": false,
    "constants": false,
    "_stream_duplex": false,
    "_stream_passthrough": false,
    "_stream_readable": false,
    "_stream_transform": false,
    "_stream_writable": false,
  };

  // Ignorar módulos problemáticos para web
  config.module.rules.push({
    test: /\.js$/,
    resolve: {
      fallback: {
        "expo-sqlite": false,
        "react-native-sqlite-storage": false,
        "sqlite3": false,
      }
    }
  });

  // Alias para evitar importaciones problemáticas
  config.resolve.alias = {
    ...config.resolve.alias,
    'expo-sqlite': false,
    'react-native-sqlite-storage': false,
    'sqlite3': false,
  };

  return config;
}; 