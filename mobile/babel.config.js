module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 'nativewind/babel', // Temporarily disabled - add back when using Tailwind classes
      'react-native-reanimated/plugin',
    ],
  };
};
