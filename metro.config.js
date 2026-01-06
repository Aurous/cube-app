// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

// Add support for resolving TypeScript path aliases
config.resolver.sourceExts.push('tsx', 'ts', 'jsx', 'js', 'json', 'cjs')
config.resolver.alias = {
  '@': './src',
}

module.exports = config
