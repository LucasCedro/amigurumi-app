/** Ambient types for deps that pull .ts sources into tsc (e.g. react-native-iap). */
declare const global: typeof globalThis & Record<string, unknown>;
