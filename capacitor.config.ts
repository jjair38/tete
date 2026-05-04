import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.socialsave.app',
  appName: 'Social Save',
  webDir: 'out',
  server: {
    // This allows the Android app to load the live website
    // so that the API routes (/api/...) continue to work.
    url: 'https://ais-dev-ef6yi2u6uh2wimqmwz3bhz-150256750639.us-east1.run.app',
    cleartext: true
  }
};

export default config;
