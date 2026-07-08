declare module "next/server.js" {
  export { NextRequest, NextResponse } from "next/server";
}

declare module "next/types.js" {
  export type ResolvingMetadata = Record<string, unknown>;
  export type ResolvingViewport = Record<string, unknown>;
}
