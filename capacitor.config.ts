import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "fr.legacymusicgroup.admin",
  appName: "LMG ADMIN",
  webDir: "public",
  server: {
    url: "https://os.lmgmusic.fr/mobile",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
  },
};

export default config;
