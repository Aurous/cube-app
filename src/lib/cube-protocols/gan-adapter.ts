/**
 * Mobile stub for GanAdapter
 * The web implementation using gan-web-bluetooth is in gan-adapter.web.ts
 * On mobile, Bluetooth will need to be implemented using expo-bluetooth or react-native-ble-manager
 */

import { BaseAdapter } from './base-adapter'
import type { CubeCapabilities, AdapterConnectOptions, CubeBrand } from './types'

export interface GanAdapterOptions {
  brand?: CubeBrand
  hasGyroscope?: boolean
}

/**
 * Mobile stub for GanAdapter
 * TODO: Implement mobile Bluetooth using expo-bluetooth or react-native-ble-manager
 */
export class GanAdapter extends BaseAdapter {
  readonly brand: CubeBrand
  readonly isExperimental: boolean
  readonly capabilities: CubeCapabilities

  constructor(options: GanAdapterOptions = {}) {
    super()
    this.brand = options.brand ?? 'gan'
    this.isExperimental = this.brand !== 'gan'
    this.capabilities = {
      gyroscope: options.hasGyroscope ?? this.brand === 'gan',
      battery: true,
      facelets: true,
    }
  }

  async connect(_options: AdapterConnectOptions = {}): Promise<void> {
    // TODO: Implement mobile Bluetooth connection
    throw new Error('GanAdapter is not yet implemented for mobile. Use web version or implement mobile Bluetooth.')
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
