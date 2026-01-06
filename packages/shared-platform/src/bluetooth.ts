/**
 * Platform-agnostic Bluetooth abstraction
 * Web: uses Web Bluetooth API
 * Mobile: uses expo-bluetooth
 */

export interface BluetoothDevice {
  id: string
  name: string | null
}

export interface BluetoothAdapter {
  isSupported(): Promise<boolean>
  requestDevice(options?: { filters?: Array<{ name?: string; services?: string[] }> }): Promise<BluetoothDevice>
  connect(deviceId: string): Promise<void>
  disconnect(deviceId: string): Promise<void>
  getCharacteristic(serviceUUID: string, characteristicUUID: string): Promise<BluetoothRemoteGATTCharacteristic | null>
  addEventListener(event: string, handler: (event: any) => void): void
  removeEventListener(event: string, handler: (event: any) => void): void
}

// Web Bluetooth implementation
class WebBluetoothAdapter implements BluetoothAdapter {
  private device: BluetoothDevice | null = null
  private server: BluetoothRemoteGATTServer | null = null

  async isSupported(): Promise<boolean> {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator
  }

  async requestDevice(options?: { filters?: Array<{ name?: string; services?: string[] }> }): Promise<BluetoothDevice> {
    if (!(await this.isSupported())) {
      throw new Error('Web Bluetooth is not supported')
    }

    const device = await navigator.bluetooth.requestDevice({
      filters: options?.filters || [],
      optionalServices: options?.filters?.flatMap(f => f.services || []) || [],
    })

    this.device = {
      id: device.id,
      name: device.name || null,
    }

    return this.device
  }

  async connect(deviceId: string): Promise<void> {
    if (!this.device || this.device.id !== deviceId) {
      throw new Error('Device not found')
    }

    // In Web Bluetooth, connection happens automatically when requesting device
    // This is a placeholder for consistency
  }

  async disconnect(deviceId: string): Promise<void> {
    if (this.device && this.device.id === deviceId) {
      // Web Bluetooth doesn't have explicit disconnect, but we can clear references
      this.device = null
      this.server = null
    }
  }

  async getCharacteristic(serviceUUID: string, characteristicUUID: string): Promise<BluetoothRemoteGATTCharacteristic | null> {
    // This would need to be implemented based on Web Bluetooth API
    // For now, return null as this is a complex abstraction
    return null
  }

  addEventListener(event: string, handler: (event: any) => void): void {
    // Web Bluetooth event handling
  }

  removeEventListener(event: string, handler: (event: any) => void): void {
    // Web Bluetooth event handling
  }
}

// Mobile Bluetooth implementation (using react-native-ble-plx)
class MobileBluetoothAdapter implements BluetoothAdapter {
  private bleManager: typeof import('react-native-ble-plx').BleManager | null = null

  private async getBleManager() {
    if (!this.bleManager) {
      const { BleManager } = await import('react-native-ble-plx')
      this.bleManager = new BleManager()
    }
    return this.bleManager
  }

  async isSupported(): Promise<boolean> {
    const manager = await this.getBleManager()
    const state = await manager.state()
    return state === 'PoweredOn'
  }

  async requestDevice(options?: { filters?: Array<{ name?: string; services?: string[] }> }): Promise<BluetoothDevice> {
    const manager = await this.getBleManager()
    
    // react-native-ble-plx uses scanning API
    // This is a placeholder - full implementation would scan for devices
    throw new Error('Mobile Bluetooth implementation needs react-native-ble-plx API integration')
  }

  async connect(deviceId: string): Promise<void> {
    const manager = await this.getBleManager()
    // react-native-ble-plx connection logic
    // await manager.connectToDevice(deviceId)
  }

  async disconnect(deviceId: string): Promise<void> {
    const manager = await this.getBleManager()
    // react-native-ble-plx disconnection logic
    // await manager.cancelDeviceConnection(deviceId)
  }

  async getCharacteristic(serviceUUID: string, characteristicUUID: string): Promise<BluetoothRemoteGATTCharacteristic | null> {
    // react-native-ble-plx characteristic access
    return null
  }

  addEventListener(event: string, handler: (event: any) => void): void {
    // react-native-ble-plx event handling
  }

  removeEventListener(event: string, handler: (event: any) => void): void {
    // react-native-ble-plx event handling
  }
}

// Platform detection
function isReactNative(): boolean {
  return typeof navigator !== 'undefined' && navigator.product === 'ReactNative'
}

// Export the appropriate adapter
// Note: Bluetooth abstraction is complex and may need platform-specific implementations
// This is a starting point that can be extended
export const bluetooth: BluetoothAdapter = isReactNative()
  ? new MobileBluetoothAdapter()
  : new WebBluetoothAdapter()
