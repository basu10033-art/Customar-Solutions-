import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.customarsolutions.app',
  appName: 'Customar Solutions',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#ffffff',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
