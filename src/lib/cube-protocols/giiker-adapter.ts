/**
 * Mobile stub for GiikerAdapter
 * The web implementation using cubing/bluetooth is in giiker-adapter.web.ts
 * On mobile, Bluetooth will need to be implemented using expo-bluetooth or react-native-ble-manager
 */

import { BaseAdapter } from './base-adapter'
import type { CubeCapabilities, AdapterConnectOptions, CubeBrand } from './types'

export class GiikerAdapter extends BaseAdapter {
  readonly brand: CubeBrand = 'giiker'
  readonly isExperimental = true
  readonly capabilities: CubeCapabilities = {
    gyroscope: false,
    battery: false,
    facelets: true,
  }

  async connect(_options: AdapterConnectOptions = {}): Promise<void> {
    // TODO: Implement mobile Bluetooth connection
    throw new Error('GiikerAdapter is not yet implemented for mobile. Use web version or implement mobile Bluetooth.')
  }

  async disconnect(): Promise<void> {
    // TODO: Implement mobile Bluetooth disconnection
  }

  async requestBattery(): Promise<void> {
    // TODO: Implement mobile battery request
  }

  async requestFacelets(): Promise<void> {
    // TODO: Implement mobile facelets request
  }
}
