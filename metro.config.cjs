// Learn more https://docs.expo.dev/guides/customizing-metro
// @ts-check
const { getDefaultConfig } = require('expo/metro-config')

/**
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname)

// Add support for resolving TypeScript path aliases
config.resolver.sourceExts.push('tsx', 'ts', 'jsx', 'js', 'json', 'cjs')
config.resolver.alias = {
  '@': './src',
}

// Metro will automatically prefer .tsx over .web.tsx for mobile builds
// No need to explicitly configure this - Metro's default resolution works correctly

module.exports = config
