import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export function GET() {
  const fingerprints = (process.env.ANDROID_SHA256_FINGERPRINTS || "").split(",").map(s => s.trim()).filter(s => /^([A-Fa-f0-9]{2}:){31}[A-Fa-f0-9]{2}$/.test(s));
  return NextResponse.json(fingerprints.length ? [{ relation: ["delegate_permission/common.handle_all_urls"], target: { namespace: "android_app", package_name: "com.wauul.arewevibing", sha256_cert_fingerprints: fingerprints } }] : [], { headers: { "Cache-Control": "public, max-age=300" } });
}
