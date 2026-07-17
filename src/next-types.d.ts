declare module 'next/server' {
  export * from 'next/dist/server/web/exports/index';
}

declare module 'next/server.js' {
  export * from 'next/dist/server/web/exports/index';
}

declare module 'next/types.js' {
  export type { ResolvingMetadata, ResolvingViewport } from 'next/dist/lib/metadata/types/metadata-interface';
}
