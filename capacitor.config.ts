import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'scorefactor',
  webDir: 'www',
  plugins: {
    BluetoothSerial: {
      permissions: ['BLUETOOTH', 'BLUETOOTH_ADMIN', 'ACCESS_COARSE_LOCATION']
    }
  }
};

export default config;
