import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wauul.arewevibing',
  appName: 'Are We Vibing',
  webDir: 'native-shell',
  // One app, two shells: Android loads the SAME live Next.js site and API as browsers.
  // Web-only deployments appear immediately in installed apps; no static export or fork.
  // Native plugin/config/icon changes still require cap sync and a new APK/store release.
  server: { url: 'https://are-we-vibing.vercel.app', cleartext: false, errorPath: 'index.html' },
  backgroundColor: '#f7f3e8',
  plugins: {
    SplashScreen: { launchShowDuration: 1200, launchAutoHide: true, backgroundColor: '#f7f3e8', showSpinner: false },
    SystemBars: { insetsHandling: 'native' },
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
  },
};

export default config;
