# Import.meta Fix for Mobile

## Issue

The `cubing` package (and potentially `react-router-dom`) uses `import.meta` which is not supported in React Native/Hermes.

## Solution Applied

1. **Babel Config** (`babel.config.cjs`):
   - Enabled `unstable_transformImportMeta: true` in `babel-preset-expo`
   - This should transform `import.meta` statements in node_modules

2. **Metro Config** (`metro.config.cjs`):
   - Configured resolver to prefer CommonJS versions
   - Set condition names to prioritize React Native compatible builds

## If Still Not Working

If you're still seeing `import.meta` errors after clearing the cache, try:

1. **Clear all caches**:

   ```bash
   rm -rf node_modules/.cache
   rm -rf .expo
   npx expo start --clear
   ```

2. **Verify Babel is transforming node_modules**:
   - Metro should transform node_modules by default
   - The `unstable_transformImportMeta` option should handle `import.meta`

3. **Alternative: Create mobile stubs for cubing**:
   - If the Babel transform still doesn't work, we may need to create mobile-specific implementations
   - This would involve creating `.web.ts` versions of files that import cubing

4. **Check cubing package version**:
   - Some versions of cubing might have better React Native support
   - Consider checking if there's a React Native compatible version

## Current Status

- ✅ Babel config has `unstable_transformImportMeta: true`
- ✅ Metro config is set to prefer CommonJS
- ⚠️ May need cache clear and restart
