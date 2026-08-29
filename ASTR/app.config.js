const IS_OSVI2026 = process.env.APP_VARIANT === 'osvi2026' || process.env.EAS_BUILD_PROFILE === 'osvi2026';

export default {
  expo: {
    name: IS_OSVI2026 ? "OSVI 2026" : "OSVI 314 V2",
    slug: "ASTR",
    version: "1.0.0",
    orientation: "portrait",
    icon: IS_OSVI2026 ? "./assets/osvi_remedios.png" : "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: { backgroundColor: "#30bced" },
    assetBundlePatterns: ["**/*"],
    ios: { supportsTablet: true },
    android: {
      adaptiveIcon: {
        foregroundImage: IS_OSVI2026 ? "./assets/osvi_remedios.png" : "./assets/icon.png",
        backgroundColor: "#ffffff"
      },
      package: IS_OSVI2026 ? "com.hernanpa.osvi2026" : "com.hernanpa.osvi314v2"
    },
    web: {
      favicon: IS_OSVI2026 ? "./assets/osvi_remedios.png" : "./assets/icon.png"
    },
    extra: {
      eas: {
        projectId: "cb45e6f4-dabf-4373-84f1-b8e4637f41f8"
      }
    },
    owner: "hernanpa",
    plugins: [
      "expo-font",
      "expo-sqlite",
      "expo-secure-store",
      "expo-local-authentication",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "OSVI usa tu ubicación al guardar pedidos para registrar dónde se crearon.",
        },
      ],
    ],
  }
};
