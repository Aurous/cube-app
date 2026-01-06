import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { BluetoothBridge } from './src/services/BluetoothBridge';
import { bluetoothBridgeScript } from './src/injections/bluetooth-bridge-string';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const bluetoothBridgeRef = useRef<BluetoothBridge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Bluetooth bridge after a delay to ensure native modules are ready
    // Use a longer delay to give native modules time to fully initialize
    const initTimer = setTimeout(async () => {
      try {
        const bridge = new BluetoothBridge();
        // Initialize without throwing - bridge will handle errors internally
        await bridge.initialize();
        bluetoothBridgeRef.current = bridge;
        console.log('Bluetooth bridge setup complete');
      } catch (err) {
        console.warn('Bluetooth bridge initialization failed, continuing without Bluetooth:', err);
        // Create a bridge instance anyway so the app doesn't crash
        // It will just return errors when Bluetooth is requested
        const bridge = new BluetoothBridge();
        bluetoothBridgeRef.current = bridge;
      }
    }, 2000); // Wait 2 seconds for native modules to be ready

    return () => {
      clearTimeout(initTimer);
      // Cleanup
      if (bluetoothBridgeRef.current) {
        bluetoothBridgeRef.current.destroy();
      }
    };
  }, []);

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (bluetoothBridgeRef.current && webViewRef.current) {
        bluetoothBridgeRef.current.handleMessage(
          message,
          (response: string) => {
            // Send response back to WebView
            // The response is already a JSON string from BluetoothBridge
            // We need to inject it so the WebView can receive it via the message event listener
            webViewRef.current?.injectJavaScript(`
              (function() {
                try {
                  const message = ${response};
                  const event = new MessageEvent('message', { data: ${response} });
                  window.dispatchEvent(event);
                } catch (e) {
                  console.error('Error dispatching message:', e);
                }
              })();
            `);
          }
        );
      }
    } catch (error) {
      console.error('Error handling message from WebView:', error);
    }
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setError(`Failed to load page: ${nativeEvent.description || 'Unknown error'}`);
    setIsLoading(false);
  };

  // Inject the Bluetooth bridge script
  const injectedJavaScript = bluetoothBridgeScript + '\ntrue; // Note: this is required, or you will sometimes get silent failures';

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>
            Please check your internet connection and try again.
          </Text>
        </View>
      ) : (
        <>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>Loading Kitsune Cube...</Text>
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={{ uri: 'https://kitsunecube.com' }}
            style={styles.webview}
            onMessage={handleMessage}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            injectedJavaScript={injectedJavaScript}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            allowsBackForwardNavigationGestures={true}
            androidLayerType="hardware"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
