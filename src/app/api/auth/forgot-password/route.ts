import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate reset token and store temporarily in password field with prefix
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store reset token — we'll use a simple approach:
    // prefix the password with "RESET:" + token + ":" + expiry timestamp
    // In a more robust system, you'd add dedicated columns
    const expiry = Date.now() + 3600000; // 1 hour
    const resetData = `RESET:${resetToken}:${expiry}:${user.password || ""}`;

    await prisma.user.update({
      where: { id: user.id },
      data: { password: resetData },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send the email
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "placeholder") {
      const result = await sendPasswordResetEmail(email, resetLink);
      if (!result.success) {
        console.error("Failed to send reset email:", result.error);
      }
    } else {
      // Fallback: log the link
      console.log(`PASSWORD RESET LINK for ${email}: ${resetLink}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
