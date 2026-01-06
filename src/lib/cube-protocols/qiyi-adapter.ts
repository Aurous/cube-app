/**
 * Mobile stub for QiyiAdapter
 * The web implementation using btcube-web is in qiyi-adapter.web.ts
 * On mobile, Bluetooth will need to be implemented using expo-bluetooth or react-native-ble-manager
 */

import { BaseAdapter } from './base-adapter'
import type { CubeCapabilities, AdapterConnectOptions, CubeBrand } from './types'

export class QiyiAdapter extends BaseAdapter {
  readonly brand: CubeBrand = 'qiyi'
  readonly isExperimental = true
  readonly capabilities: CubeCapabilities = {
    gyroscope: false,
    battery: true,
    facelets: true,
  }

  async connect(_options: AdapterConnectOptions = {}): Promise<void> {
    // TODO: Implement mobile Bluetooth connection
    throw new Error('QiyiAdapter is not yet implemented for mobile. Use web version or implement mobile Bluetooth.')
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
