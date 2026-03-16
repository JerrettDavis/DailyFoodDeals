import { NextResponse, type NextRequest } from "next/server";
import { canUseRuntimeAuth } from "@/lib/runtime-config";

function getFallbackResponse(request: NextRequest) {
  const pathname = new URL(request.url).pathname;

  if (pathname.endsWith("/session")) {
    return NextResponse.json(null);
  }

  if (pathname.endsWith("/providers")) {
    return NextResponse.json({});
  }

  return NextResponse.json(
    { message: "Authentication is temporarily unavailable on this deployment." },
    { status: 503 }
  );
}

export async function GET(request: NextRequest) {
  if (!canUseRuntimeAuth) {
    return getFallbackResponse(request);
  }

  const { handlers } = await import("@/lib/auth");
  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  if (!canUseRuntimeAuth) {
    return NextResponse.json(
      { message: "Authentication is temporarily unavailable on this deployment." },
      { status: 503 }
    );
  }

  const { handlers } = await import("@/lib/auth");
  return handlers.POST(request);
}
