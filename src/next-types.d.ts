declare module 'next/server.js' {
  export * from 'next/dist/server/web/exports/index';
  export { NextRequest } from 'next/dist/server/web/spec-extension/request';
}

declare module 'next/types.js' {
  export type { ResolvingMetadata, ResolvingViewport } from 'next/dist/lib/metadata/types/metadata-interface';
}
