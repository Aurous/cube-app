// Web Bluetooth API Bridge
// This script intercepts Web Bluetooth API calls and forwards them to the native app

(function() {
  'use strict';

  // Check if we're in a WebView with the bridge
  if (!window.ReactNativeWebView) {
    console.warn('Bluetooth bridge: ReactNativeWebView not found');
    return;
  }

  let requestIdCounter = 0;
  const pendingRequests = new Map();

  // Helper to send messages to native
  function sendToNative(message) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
  }

  // Helper to wait for native response
  function waitForResponse(requestId) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pendingRequests.delete(requestId);
        reject(new Error('Request timeout'));
      }, 30000);

      pendingRequests.set(requestId, { resolve, reject, timeout });
    });
  }

  // Listen for messages from native
  window.addEventListener('message', (event) => {
    try {
      const message = JSON.parse(event.data);
      const request = pendingRequests.get(message.id);
      
      if (request) {
        clearTimeout(request.timeout);
        pendingRequests.delete(message.id);

        if (message.error) {
          request.reject(new Error(message.error));
        } else {
          request.resolve(message.data);
        }
      } else if (message.type === 'deviceFound') {
        // Handle device found events
        if (window.bluetoothDeviceFoundCallback) {
          window.bluetoothDeviceFoundCallback(message.data);
        }
      } else if (message.type === 'characteristicValueChanged') {
        // Handle characteristic value changes
        if (window.bluetoothCharacteristicValueChangedCallback) {
          window.bluetoothCharacteristicValueChangedCallback(message.data);
        }
      } else if (message.type === 'gattserverdisconnected') {
        // Handle disconnection events
        if (window.bluetoothDisconnectedCallback) {
          window.bluetoothDisconnectedCallback(message.data);
        }
      }
    } catch (error) {
      console.error('Bluetooth bridge: Error parsing message', error);
    }
  });

  // Override navigator.bluetooth if it exists
  if (navigator.bluetooth) {
    const originalRequestDevice = navigator.bluetooth.requestDevice.bind(navigator.bluetooth);
    
    navigator.bluetooth.requestDevice = async function(options) {
      const requestId = `req_${++requestIdCounter}`;
      
      return new Promise((resolve, reject) => {
        // Store callback for device selection
        window.bluetoothDeviceFoundCallback = (deviceData) => {
          // Create a mock BluetoothDevice
          const mockDevice = createMockBluetoothDevice(deviceData);
          resolve(mockDevice);
        };

        sendToNative({
          type: 'requestDevice',
          id: requestId,
          data: {
            filters: options.filters,
            optionalServices: options.optionalServices
          }
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          if (pendingRequests.has(requestId)) {
            pendingRequests.delete(requestId);
            delete window.bluetoothDeviceFoundCallback;
            reject(new DOMException('No device selected', 'NotFoundError'));
          }
        }, 10000);
      });
    };
  } else {
    // Create navigator.bluetooth if it doesn't exist
    navigator.bluetooth = {
      requestDevice: async function(options) {
        const requestId = `req_${++requestIdCounter}`;
        
        return new Promise((resolve, reject) => {
          window.bluetoothDeviceFoundCallback = (deviceData) => {
            const mockDevice = createMockBluetoothDevice(deviceData);
            resolve(mockDevice);
          };

          sendToNative({
            type: 'requestDevice',
            id: requestId,
            data: {
              filters: options.filters,
              optionalServices: options.optionalServices
            }
          });

          setTimeout(() => {
            if (pendingRequests.has(requestId)) {
              pendingRequests.delete(requestId);
              delete window.bluetoothDeviceFoundCallback;
              reject(new DOMException('No device selected', 'NotFoundError'));
            }
          }, 10000);
        });
      }
    };
  }

  // Create a mock BluetoothDevice
  function createMockBluetoothDevice(deviceData) {
    const deviceId = deviceData.id;
    let connected = false;
    const services = new Map();
    const characteristics = new Map();

    const device = {
      id: deviceId,
      name: deviceData.name,
      gatt: {
        connect: async function() {
          if (connected) return;
          
          const requestId = `req_${++requestIdCounter}`;
          sendToNative({
            type: 'connect',
            id: requestId,
            data: { deviceId }
          });

          try {
            await waitForResponse(requestId);
            connected = true;
          } catch (error) {
            throw new DOMException(error.message, 'NetworkError');
          }
        },
        disconnect: async function() {
          if (!connected) return;
          
          const requestId = `req_${++requestIdCounter}`;
          sendToNative({
            type: 'disconnect',
            id: requestId,
            data: { deviceId }
          });

          try {
            await waitForResponse(requestId);
            connected = false;
            services.clear();
            characteristics.clear();
          } catch (error) {
            throw new DOMException(error.message, 'NetworkError');
          }
        },
        getPrimaryService: async function(serviceUUID) {
          if (!connected) {
            throw new DOMException('Device not connected', 'NetworkError');
          }

          const cacheKey = `service_${serviceUUID}`;
          if (services.has(cacheKey)) {
            return services.get(cacheKey);
          }

          const requestId = `req_${++requestIdCounter}`;
          sendToNative({
            type: 'getPrimaryService',
            id: requestId,
            data: { deviceId, serviceUUID }
          });

          try {
            await waitForResponse(requestId);
            const service = createMockBluetoothRemoteGATTService(deviceId, serviceUUID);
            services.set(cacheKey, service);
            return service;
          } catch (error) {
            throw new DOMException(error.message, 'NetworkError');
          }
        }
      },
      addEventListener: function(event, callback) {
        if (event === 'gattserverdisconnected') {
          window.bluetoothDisconnectedCallback = (data) => {
            if (data.deviceId === deviceId) {
              connected = false;
              callback();
            }
          };
        }
      },
      removeEventListener: function(event, callback) {
        if (event === 'gattserverdisconnected') {
          delete window.bluetoothDisconnectedCallback;
        }
      }
    };

    return device;
  }

  // Create a mock BluetoothRemoteGATTService
  function createMockBluetoothRemoteGATTService(deviceId, serviceUUID) {
    const characteristics = new Map();

    return {
      uuid: serviceUUID,
      device: { id: deviceId },
      getCharacteristic: async function(characteristicUUID) {
        const cacheKey = `char_${characteristicUUID}`;
        if (characteristics.has(cacheKey)) {
          return characteristics.get(cacheKey);
        }

        const requestId = `req_${++requestIdCounter}`;
        sendToNative({
          type: 'getCharacteristic',
          id: requestId,
          data: { deviceId, serviceUUID, characteristicUUID }
        });

        try {
          const data = await waitForResponse(requestId);
          const characteristic = createMockBluetoothRemoteGATTCharacteristic(
            deviceId,
            serviceUUID,
            characteristicUUID,
            data.properties
          );
          characteristics.set(cacheKey, characteristic);
          return characteristic;
        } catch (error) {
          throw new DOMException(error.message, 'NetworkError');
        }
      }
    };
  }

  // Create a mock BluetoothRemoteGATTCharacteristic
  function createMockBluetoothRemoteGATTCharacteristic(deviceId, serviceUUID, characteristicUUID, properties) {
    let value = null;
    let notificationCallback = null;

    return {
      uuid: characteristicUUID,
      service: { uuid: serviceUUID },
      properties: {
        read: properties.read || false,
        write: properties.write || false,
        notify: properties.notify || false
      },
      readValue: async function() {
        if (!properties.read) {
          throw new DOMException('Characteristic does not support read', 'NotSupportedError');
        }

        const requestId = `req_${++requestIdCounter}`;
        sendToNative({
          type: 'readValue',
          id: requestId,
          data: { deviceId, serviceUUID, characteristicUUID }
        });

        try {
          const data = await waitForResponse(requestId);
          value = data.value;
          return {
            getValue: function() {
              // Convert base64 to ArrayBuffer
              const binaryString = atob(value);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              return bytes.buffer;
            }
          };
        } catch (error) {
          throw new DOMException(error.message, 'NetworkError');
        }
      },
      writeValue: async function(buffer) {
        if (!properties.write) {
          throw new DOMException('Characteristic does not support write', 'NotSupportedError');
        }

        // Convert ArrayBuffer to base64
        const bytes = new Uint8Array(buffer);
        const binaryString = String.fromCharCode(...bytes);
        const base64Value = btoa(binaryString);

        const requestId = `req_${++requestIdCounter}`;
        sendToNative({
          type: 'writeValue',
          id: requestId,
          data: { deviceId, serviceUUID, characteristicUUID, value: base64Value }
        });

        try {
          await waitForResponse(requestId);
        } catch (error) {
          throw new DOMException(error.message, 'NetworkError');
        }
      },
      startNotifications: async function() {
        if (!properties.notify) {
          throw new DOMException('Characteristic does not support notifications', 'NotSupportedError');
        }

        const requestId = `req_${++requestIdCounter}`;
        sendToNative({
          type: 'startNotifications',
          id: requestId,
          data: { deviceId, serviceUUID, characteristicUUID }
        });

        try {
          await waitForResponse(requestId);
          
          // Set up callback for value changes
          window.bluetoothCharacteristicValueChangedCallback = (data) => {
            if (data.deviceId === deviceId && 
                data.serviceUUID === serviceUUID && 
                data.characteristicUUID === characteristicUUID) {
              const event = {
                target: {
                  value: {
                    getValue: function() {
                      const binaryString = atob(data.value);
                      const bytes = new Uint8Array(binaryString.length);
                      for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                      }
                      return bytes.buffer;
                    }
                  }
                }
              };
              if (notificationCallback) {
                notificationCallback(event);
              }
            }
          };
        } catch (error) {
          throw new DOMException(error.message, 'NetworkError');
        }
      },
      stopNotifications: async function() {
        const requestId = `req_${++requestIdCounter}`;
        sendToNative({
          type: 'stopNotifications',
          id: requestId,
          data: { deviceId, serviceUUID, characteristicUUID }
        });

        try {
          await waitForResponse(requestId);
          notificationCallback = null;
        } catch (error) {
          throw new DOMException(error.message, 'NetworkError');
        }
      },
      addEventListener: function(event, callback) {
        if (event === 'characteristicvaluechanged') {
          notificationCallback = callback;
        }
      },
      removeEventListener: function(event, callback) {
        if (event === 'characteristicvaluechanged') {
          notificationCallback = null;
        }
      }
    };
  }

  console.log('Bluetooth bridge: Web Bluetooth API bridge initialized');
})();
