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

// Configure resolver to prefer CommonJS/require versions
// This helps avoid ESM versions that use import.meta
config.resolver.unstable_conditionNames = ['require', 'react-native', 'browser', 'import', 'default']

// Configure transformer - Babel will transform import.meta with unstable_transformImportMeta
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  // Ensure all JavaScript files are transformed, including node_modules
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
}

// Metro will automatically prefer .tsx over .web.tsx for mobile builds
// No need to explicitly configure this - Metro's default resolution works correctly

module.exports = config
