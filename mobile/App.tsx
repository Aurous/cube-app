import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ScrollView, Alert, Platform, PermissionsAndroid } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';

const bleManager = new BleManager();

export default function App() {
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [filterNames] = useState(['gan']); // Filter for device names containing these strings

  useEffect(() => {
    return () => {
      bleManager.destroy();
    };
  }, []);

  const filterDevices = (deviceList: Device[]): Device[] => {
    return deviceList.filter(d => {
      const name = d.name ? d.name.toLowerCase() : '';
      return filterNames.some(filter => name.includes(filter.toLowerCase()));
    });
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const sdk = typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : (Platform.Version as number);
        const permissions: string[] = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ];

        if (sdk >= 31) {
          // Android 12+ needs these runtime permissions
          permissions.push('android.permission.BLUETOOTH_SCAN');
          permissions.push('android.permission.BLUETOOTH_CONNECT');
          permissions.push('android.permission.BLUETOOTH_ADVERTISE');
        } else {
          permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH || 'android.permission.BLUETOOTH');
          permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN || 'android.permission.BLUETOOTH_ADMIN');
        }

        const result = await PermissionsAndroid.requestMultiple(permissions);
        const allGranted = Object.values(result).every((v) => v === PermissionsAndroid.RESULTS.GRANTED);
        if (!allGranted) {
          Alert.alert('Permissions required', 'Bluetooth and location permissions are required to scan for devices.');
        }
        return allGranted;
      } catch (err) {
        console.warn('Permission request error', err);
        Alert.alert('Error', 'Failed to request permissions');
        return false;
      }
    }

    // iOS: permissions are declared in Info.plist (app.json). CoreBluetooth prompts the user when needed.
    return true;
  };

  const startBluetoothScan = async () => {
    try {
      const granted = await requestPermissions();
      if (!granted) return;

      setIsScanning(true);
      setDevices([]);

      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Bluetooth scan error:', error);
          setIsScanning(false);
          return;
        }

        if (device?.name) {
          setDevices((prevDevices) => {
            const exists = prevDevices.some((d) => d.id === device.id);
            return exists ? prevDevices : [...prevDevices, device];
          });
        }
      });

      // Stop scanning after 10 seconds
      setTimeout(() => {
        bleManager.stopDeviceScan();
        setIsScanning(false);
      }, 10000);
    } catch (error) {
      console.error('Error starting Bluetooth scan:', error);
      Alert.alert('Error', 'Failed to start Bluetooth scan');
      setIsScanning(false);
    }
  };

  const connectToDevice = async (device: Device) => {
    try {
      bleManager.stopDeviceScan();
      const connectedDevice = await device.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connectedDevice);
      Alert.alert('Connected', `Connected to ${device.name || 'Unknown Device'}`);
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Error', 'Failed to connect to device');
    }
  };

  const disconnectDevice = async () => {
    try {
      if (connectedDevice) {
        await connectedDevice.cancelConnection();
        setConnectedDevice(null);
        Alert.alert('Disconnected', 'Device disconnected successfully');
      }
    } catch (error) {
      console.error('Disconnection error:', error);
      Alert.alert('Error', 'Failed to disconnect');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bluetooth Device Manager</Text>

      {connectedDevice ? (
        <View style={styles.connectedSection}>
          <Text style={styles.connectedText}>
            Connected to: {connectedDevice.name || 'Unknown Device'}
          </Text>
          <Button
            title="Disconnect"
            onPress={disconnectDevice}
            color="#ff6b6b"
          />
        </View>
      ) : (
        <View style={styles.scanSection}>
          <Button
            title={isScanning ? 'Scanning...' : 'Scan for Devices'}
            onPress={startBluetoothScan}
            disabled={isScanning}
            color="#4CAF50"
          />

          <ScrollView style={styles.deviceList}>
            {devices.length === 0 ? (
              <Text style={styles.emptyText}>
                {isScanning ? 'Scanning for devices...' : 'No devices found'}
              </Text>
            ) : (
              filterDevices(devices).map((device) => (
                <View key={device.id} style={styles.deviceItem}>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>
                      {device.name || 'Unknown Device'}
                    </Text>
                    <Text style={styles.deviceId}>{device.id}</Text>
                  </View>
                  <Button
                    title="Connect"
                    onPress={() => connectToDevice(device)}
                    color="#2196F3"
                  />
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}

      <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  scanSection: {
    flex: 1,
    width: '100%',
    marginTop: 8,
  },
  connectedSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#4CAF50',
    fontWeight: '600',
  },
  deviceList: {
    marginTop: 20,
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  deviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
  },
});
