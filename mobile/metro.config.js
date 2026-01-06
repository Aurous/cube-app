const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Custom resolver for cubing subpath exports
const defaultResolver = config.resolver.resolveRequest;

config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver?.sourceExts || []), 'mjs', 'cjs'],
  unstable_enablePackageExports: true,
  unstable_conditionNames: ['react-native', 'require', 'default'],
  resolveRequest: (context, moduleName, platform) => {
    // Handle cubing subpath exports
    if (moduleName.startsWith('cubing/')) {
      const subpath = moduleName.replace('cubing/', '');
      const resolvedPath = path.resolve(
        __dirname,
        'node_modules',
        'cubing',
        'dist',
        'lib',
        'cubing',
        subpath,
        'index.js'
      );
      try {
        return {
          filePath: resolvedPath,
          type: 'sourceFile',
        };
      } catch (e) {
        // Fall through to default resolver
      }
    }
    // Use default resolver for everything else
    return defaultResolver ? defaultResolver(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
