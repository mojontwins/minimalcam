import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'es.juntadeandalucia.minimalcam',
  appName: 'minimalcam',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },

  cordova: {
    preferences: {
      'android-minSdkVersion': '22',
      'android-compileSdkVersion': '29',
      'android-targetSdkVersion': '29',
      'android:requestLegacyExternalStorage': 'true',
    },
  },
};

export default config;
