// Fallback type definitions
declare module '*.css';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';

// Augment the global NodeJS namespace to include API_KEY in ProcessEnv
// This avoids redeclaring 'process' which causes conflicts with @types/node
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}
