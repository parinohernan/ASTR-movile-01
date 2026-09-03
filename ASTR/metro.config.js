const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Solo artefactos nativos/Gradle — NO bloquear node_modules/*/build/ (expo-asset, expo-sqlite, etc.)
const nativeBuildExclusions = [
  /\/android\/build\//,
  /\/android\/\.gradle\//,
  /\/ios\/build\//,
  /\/ios\/Pods\//,
  /\/\.gradle\//,
  /\/\.cxx\//,
  /\/node_modules\/.*\/android\/build\//,
  /\/node_modules\/.*\/android\/\.gradle\//,
  /\/node_modules\/.*\/expo-module-gradle-plugin\/build\//,
];

const existingBlockList = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existingBlockList)
    ? existingBlockList
    : existingBlockList
      ? [existingBlockList]
      : []),
  ...nativeBuildExclusions,
];

module.exports = config;
