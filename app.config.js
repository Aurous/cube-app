export default {
  expo: {
    name: 'Cube Timer',
    slug: 'cube-timer',
    version: '0.1.3',
    orientation: 'portrait',
    icon: './public/favicon.svg',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './public/og-image.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.cubetimer.app',
      infoPlist: {
        NSBluetoothAlwaysUsageDescription:
          'This app needs Bluetooth access to connect to smart cubes.',
        NSBluetoothPeripheralUsageDescription:
          'This app needs Bluetooth access to connect to smart cubes.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './public/favicon.svg',
        backgroundColor: '#000000',
      },
      package: 'com.cubetimer.app',
      permissions: [
        'BLUETOOTH',
        'BLUETOOTH_ADMIN',
        'BLUETOOTH_CONNECT',
        'BLUETOOTH_SCAN',
      ],
    },
    web: {
      favicon: './public/favicon.svg',
      bundler: 'metro',
    },
    plugins: [
      [
        'expo-router',
        {
          root: './src',
        },
      ],
    ],
    scheme: 'cube-timer',
    extra: {
      eas: {
        projectId: 'your-project-id',
      },
    },
  },
}
