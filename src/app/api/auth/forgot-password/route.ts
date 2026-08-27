import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

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

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in user record
    // Note: In production, you'd add resetToken and resetTokenExpires fields to User model
    // For now, we'll use a simple approach with the user's existing fields
    // TODO: Add proper reset token storage and email sending

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Log the reset link (in production, send this via email)
    console.log(`
    ========================================
    PASSWORD RESET REQUEST
    ========================================
    Email: ${email}
    Reset Link: ${resetLink}
    Expires: ${resetExpires.toISOString()}
    ========================================
    
    TO SEND EMAILS IN PRODUCTION:
    Set up Resend, SendGrid, or Mailgun and 
    send this link to the user's email.
    ========================================
    `);

    // In production, you would send an email here:
    // await sendEmail({
    //   to: email,
    //   subject: "Reset your GiftFlick password",
    //   html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
    // });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
