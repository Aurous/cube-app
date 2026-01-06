import { BleManager, Device, Characteristic, Service } from 'react-native-ble-plx';
import { NativeModules, Platform } from 'react-native';

export interface BluetoothMessage {
  type: string;
  id?: string;
  data?: any;
  error?: string;
}

// Check if the native module is available
// Note: This is a best-effort check. The real test is when we try to create BleManager
function isNativeModuleAvailable(): boolean {
  try {
    // The native module might not be exposed directly, so we can't reliably check
    // We'll try to create BleManager and catch the error if it fails
    // For now, always return true and let the constructor handle it
    return true;
  } catch (error) {
    return false;
  }
}

export class BluetoothBridge {
  private manager: BleManager | null = null;
  private connectedDevices: Map<string, Device> = new Map();
  private messageHandlers: Map<string, (message: BluetoothMessage) => void> = new Map();
  private requestIdCounter = 0;
  private isInitialized = false;
  private isAvailable = false;

  constructor() {
    // Don't initialize here - wait until native module is ready
    this.isAvailable = isNativeModuleAvailable();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized && this.manager) {
      return;
    }

    // Check if native module is available
    if (!this.isAvailable) {
      console.warn('Bluetooth native module not available. Bluetooth features will be disabled.');
      return;
    }

    try {
      // Add a small delay to ensure native modules are fully loaded
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to create BLE manager - wrap in try-catch to handle native module errors
      try {
        this.manager = new BleManager();
      } catch (constructorError: any) {
        // If constructor fails, native module isn't available
        console.warn('BleManager constructor failed, native module not available:', constructorError?.message || constructorError);
        this.manager = null;
        this.isAvailable = false;
        return;
      }
      
      if (!this.manager) {
        return;
      }
      
      // Wait for BLE manager to be ready with a timeout
      const statePromise = this.manager.state();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout waiting for BLE state')), 5000)
      );
      
      const state = await Promise.race([statePromise, timeoutPromise]) as string;
      
      // Check if Bluetooth is available
      if (state === 'Unsupported' || state === 'Unauthorized') {
        console.warn(`Bluetooth is ${state.toLowerCase()}`);
        this.manager = null;
        return;
      }
      
      this.isInitialized = true;
      console.log('Bluetooth bridge initialized successfully');
    } catch (error: any) {
      console.warn('Failed to initialize BLE Manager:', error?.message || error);
      this.manager = null;
      this.isInitialized = false;
      // Don't throw - allow app to continue without Bluetooth
    }
  }

  private ensureInitialized(): void {
    if (!this.manager || !this.isInitialized) {
      throw new Error('Bluetooth bridge not initialized. Call initialize() first.');
    }
  }

  handleMessage(message: BluetoothMessage, sendToWebView: (message: string) => void): void {
    if (!this.isAvailable || !this.isInitialized || !this.manager) {
      sendToWebView(JSON.stringify({
        type: 'error',
        id: message.id,
        error: 'Bluetooth is not available on this device'
      }));
      return;
    }

    switch (message.type) {
      case 'requestDevice':
        this.handleRequestDevice(message, sendToWebView);
        break;
      case 'connect':
        this.handleConnect(message, sendToWebView);
        break;
      case 'disconnect':
        this.handleDisconnect(message, sendToWebView);
        break;
      case 'getPrimaryService':
        this.handleGetPrimaryService(message, sendToWebView);
        break;
      case 'getCharacteristic':
        this.handleGetCharacteristic(message, sendToWebView);
        break;
      case 'readValue':
        this.handleReadValue(message, sendToWebView);
        break;
      case 'writeValue':
        this.handleWriteValue(message, sendToWebView);
        break;
      case 'startNotifications':
        this.handleStartNotifications(message, sendToWebView);
        break;
      case 'stopNotifications':
        this.handleStopNotifications(message, sendToWebView);
        break;
      default:
        sendToWebView(JSON.stringify({
          type: 'error',
          id: message.id,
          error: `Unknown message type: ${message.type}`
        }));
    }
  }

  private async handleRequestDevice(message: BluetoothMessage, sendToWebView: (message: string) => void): Promise<void> {
    try {
      this.ensureInitialized();
      const { filters, optionalServices } = message.data || {};
      
      // Start scanning for devices
      const serviceUUIDs = filters?.services || optionalServices || [];
      let deviceFound = false;
      const scanTimeout = setTimeout(() => {
        if (this.manager) {
          this.manager.stopDeviceScan();
        }
        if (!deviceFound) {
          sendToWebView(JSON.stringify({
            type: 'requestDeviceError',
            id: message.id,
            error: 'No device found'
          }));
        }
      }, 10000);
      
      if (!this.manager) {
        throw new Error('BLE Manager not initialized');
      }
      
      this.manager.startDeviceScan(
        serviceUUIDs.length > 0 ? serviceUUIDs : null,
        null,
        (error, device) => {
          if (error) {
            clearTimeout(scanTimeout);
            this.manager.stopDeviceScan();
            sendToWebView(JSON.stringify({
              type: 'requestDeviceError',
              id: message.id,
              error: error.message
            }));
            return;
          }

          if (device && !deviceFound) {
            deviceFound = true;
            clearTimeout(scanTimeout);
            this.manager.stopDeviceScan();
            
            // Send device found event - automatically select first matching device
            sendToWebView(JSON.stringify({
              type: 'deviceFound',
              id: message.id,
              data: {
                id: device.id,
                name: device.name || 'Unknown Device',
                rssi: device.rssi
              }
            }));
          }
        }
      );

    } catch (error: any) {
      sendToWebView(JSON.stringify({
        type: 'requestDeviceError',
        id: message.id,
        error: error.message || 'Failed to request device'
      }));
    }
  }

  private async handleConnect(message: BluetoothMessage, sendToWebView: (message: string) => void): Promise<void> {
    try {
      this.ensureInitialized();
      const { deviceId } = message.data || {};
      
      if (!deviceId) {
        throw new Error('Device ID is required');
      }

      if (!this.manager) {
        throw new Error('BLE Manager not initialized');
      }

      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      
      this.connectedDevices.set(deviceId, device);

      // Listen for disconnection
      device.onDisconnected((error, device) => {
        this.connectedDevices.delete(deviceId);
        sendToWebView(JSON.stringify({
          type: 'gattserverdisconnected',
          data: { deviceId }
        }));
      });

      sendToWebView(JSON.stringify({
        type: 'connectSuccess',
        id: message.id,
        data: {
          deviceId: device.id,
          name: device.name
        }
      }));

    } catch (error: any) {
      sendToWebView(JSON.stringify({
        type: 'connectError',
        id: message.id,
        error: error.message || 'Failed to connect'
      }));
    }
  }

  private async handleDisconnect(message: BluetoothMessage, sendToWebView: (message: string) => void): Promise<void> {
    try {
      const { deviceId } = message.data || {};
      
      if (!deviceId) {
        throw new Error('Device ID is required');
      }

      const device = this.connectedDevices.get(deviceId);
      if (device) {
        await device.cancelConnection();
        this.connectedDevices.delete(deviceId);
      }

      sendToWebView(JSON.stringify({
        type: 'disconnectSuccess',
        id: message.id
      }));

    } catch (error: any) {
      sendToWebView(JSON.stringify({
        type: 'disconnectError',
        id: message.id,
        error: error.message || 'Failed to disconnect'
      }));
    }
  }

  private async handleGetPrimaryService(message: BluetoothMessage, sendToWebView: (message: string) => void): Promise<void> {
    try {
      const { deviceId, serviceUUID } = message.data || {};
      
      if (!deviceId || !serviceUUID) {
        throw new Error('Device ID and service UUID are required');
      }

      const device = this.connectedDevices.get(deviceId);
      if (!device) {
        throw new Error('Device not connected');
      }

      const service = await device.services().then(services => 
        services.find(s => s.uuid.toLowerCase() === serviceUUID.toLowerCase())
      );

      if (!service) {
        throw new Error(`Service ${serviceUUID} not found`);
      }

      sendToWebView(JSON.stringify({
        type: 'getPrimaryServiceSuccess',
        id: message.id,
        data: {
          uuid: service.uuid
        }
      }));

    } catch (error: any) {
      sendToWebView(JSON.stringify({
        type: 'getPrimaryServiceError',
        id: message.id,
        error: error.message || 'Failed to get primary service'
      }));
    }
  }

  private async handleGetCharacteristic(message: BluetoothMessage, sendToWebView: (message: string) => void): Promise<void> {
    try {
      const { deviceId, serviceUUID, characteristicUUID } = message.data || {};
      
      if (!deviceId || !serviceUUID || !characteristicUUID) {
        throw new Error('Device ID, service UUID, and characteristic UUID are required');
      }

      const device = this.connectedDevices.get(deviceId);
      if (!device) {
        throw new Error('Device not connected');
      }

      const service = await device.services().then(services => 
        services.find(s => s.uuid.toLowerCase() === serviceUUID.toLowerCase())
      );

      if (!service) {
        throw new Error(`Service ${serviceUUID} not found`);
      }

      const characteristic = await service.characteristics().then(chars =>
        chars.find(c => c.uuid.toLowerCase() === characteristicUUID.toLowerCase())
      );

      if (!characteristic) {
        throw new Error(`Characteristic ${characteristicUUID} not found`);
      }

      sendToWebView(JSON.stringify({
        type: 'getCharacteristicSuccess',
        id: message.id,
        data: {
          uuid: characteristic.uuid,
          properties: {
            read: characteristic.isReadable,
            write: characteristic.isWritableWithoutResponse || characteristic.isWritableWithResponse,
            notify: characteristic.isNotifiable
          }
        }
      }));

    } catch (error: any) {
      sendToWebView(JSON.stringify({
        type: 'getCharacteristicError',
        id: message.id,
        error: error.message || 'Failed to get characteristic'
      }));
    }
  }

  private async handleReadValue(message: BluetoothMessage, sendToWebView: (message: string) => void): Promise<void> {
    try {
      const { deviceId, serviceUUID, characteristicUUID } = message.data || {};
      
      if (!deviceId || !serviceUUID || !characteristicUUID) {
        throw new Error('Device ID, service UUID, and characteristic UUID are required');
      }

      const device = this.connectedDevices.get(deviceId);
      if (!device) {
        throw new Error('Device not connected');
      }

      const service = await device.services().then(services => 
        services.find(s => s.uuid.toLowerCase() === serviceUUID.toLowerCase())
      );

      if (!service) {
        throw new Error(`Service ${serviceUUID} not found`);
      }

      const characteristic = await service.characteristics().then(chars =>
        chars.find(c => c.uuid.toLowerCase() === characteristicUUID.toLowerCase())
      );

      if (!characteristic) {
        throw new Error(`Characteristic ${characteristicUUID} not found`);
      }

      const value = await characteristic.read();
      const base64Value = value.base64 || '';

      sendToWebView(JSON.stringify({
        type: 'readValueSuccess',
        id: message.id,
        data: {
          value: base64Value
        }
      }));

    } catch (error: any) {
      sendToWebView(JSON.stringify({
        type: 'readValueError',
        id: message.id,
        error: error.message || 'Failed to read value'
      }));
    }
  }

  private async handleWriteValue(message: BluetoothMessage, sendToWebView: (message: string) => void): Promise<void> {
    try {
      const { deviceId, serviceUUID, characteristicUUID, value, writeType } = message.data || {};
      
      if (!deviceId || !serviceUUID || !characteristicUUID || !value) {
        throw new Error('Device ID, service UUID, characteristic UUID, and value are required');
      }

      const device = this.connectedDevices.get(deviceId);
      if (!device) {
        throw new Error('Device not connected');
      }

      const service = await device.services().then(services => 
        services.find(s => s.uuid.toLowerCase() === serviceUUID.toLowerCase())
      );

      if (!service) {
        throw new Error(`Service ${serviceUUID} not found`);
      }

      const characteristic = await service.characteristics().then(chars =>
        chars.find(c => c.uuid.toLowerCase() === characteristicUUID.toLowerCase())
      );

      if (!characteristic) {
        throw new Error(`Characteristic ${characteristicUUID} not found`);
      }

      // Convert base64 string to write
      // Use writeWithoutResponse for better performance, fallback to writeWithResponse if needed
      try {
        await characteristic.writeWithoutResponse(value);
      } catch (error) {
        // Some characteristics require writeWithResponse
        await characteristic.writeWithResponse(value);
      }

      sendToWebView(JSON.stringify({
        type: 'writeValueSuccess',
        id: message.id
      }));

    } catch (error: any) {
      sendToWebView(JSON.stringify({
        type: 'writeValueError',
        id: message.id,
        error: error.message || 'Failed to write value'
      }));
    }
  }

  private async handleStartNotifications(message: BluetoothMessage, sendToWebView: (message: string) => void): Promise<void> {
    try {
      const { deviceId, serviceUUID, characteristicUUID } = message.data || {};
      
      if (!deviceId || !serviceUUID || !characteristicUUID) {
        throw new Error('Device ID, service UUID, and characteristic UUID are required');
      }

      const device = this.connectedDevices.get(deviceId);
      if (!device) {
        throw new Error('Device not connected');
      }

      const service = await device.services().then(services => 
        services.find(s => s.uuid.toLowerCase() === serviceUUID.toLowerCase())
      );

      if (!service) {
        throw new Error(`Service ${serviceUUID} not found`);
      }

      const characteristic = await service.characteristics().then(chars =>
        chars.find(c => c.uuid.toLowerCase() === characteristicUUID.toLowerCase())
      );

      if (!characteristic) {
        throw new Error(`Characteristic ${characteristicUUID} not found`);
      }

      // Monitor characteristic for notifications
      characteristic.monitor((error, char) => {
        if (error) {
          sendToWebView(JSON.stringify({
            type: 'characteristicValueChangedError',
            data: { deviceId, serviceUUID, characteristicUUID },
            error: error.message
          }));
          return;
        }

        if (char) {
          const base64Value = char.value || '';
          sendToWebView(JSON.stringify({
            type: 'characteristicValueChanged',
            data: {
              deviceId,
              serviceUUID,
              characteristicUUID,
              value: base64Value
            }
          }));
        }
      });

      sendToWebView(JSON.stringify({
        type: 'startNotificationsSuccess',
        id: message.id
      }));

    } catch (error: any) {
      sendToWebView(JSON.stringify({
        type: 'startNotificationsError',
        id: message.id,
        error: error.message || 'Failed to start notifications'
      }));
    }
  }

  private async handleStopNotifications(message: BluetoothMessage, sendToWebView: (message: string) => void): Promise<void> {
    try {
      const { deviceId, serviceUUID, characteristicUUID } = message.data || {};
      
      // Note: react-native-ble-plx doesn't have a direct way to stop monitoring
      // The monitor will stop when the characteristic is no longer accessible
      // or when the device disconnects

      sendToWebView(JSON.stringify({
        type: 'stopNotificationsSuccess',
        id: message.id
      }));

    } catch (error: any) {
      sendToWebView(JSON.stringify({
        type: 'stopNotificationsError',
        id: message.id,
        error: error.message || 'Failed to stop notifications'
      }));
    }
  }

  destroy(): void {
    // Disconnect all devices
    this.connectedDevices.forEach(async (device) => {
      try {
        await device.cancelConnection();
      } catch (error) {
        // Ignore errors during cleanup
      }
    });
    this.connectedDevices.clear();
    if (this.manager) {
      this.manager.destroy();
      this.manager = null;
    }
    this.isInitialized = false;
  }
}
