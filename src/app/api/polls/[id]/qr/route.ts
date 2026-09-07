import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pollId = params.id;
    // Derive base URL from request headers
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const votingUrl = `${protocol}://${host}/poll/${pollId}`;

    // Generate high quality QR code data URL
    const qrDataUrl = await QRCode.toDataURL(votingUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });

    return NextResponse.json({
      url: votingUrl,
      qrDataUrl,
    });
  } catch (error: unknown) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
