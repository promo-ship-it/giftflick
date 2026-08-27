const FROM_EMAIL = process.env.FROM_EMAIL || "GiftFlick <onboarding@resend.dev>";

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset your GiftFlick password",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #d946ef; margin: 0;">GiftFlick</h1>
            <p style="color: #666; margin-top: 5px;">AI-Powered Video Messages</p>
          </div>
          
          <h2 style="color: #333;">Reset Your Password</h2>
          
          <p style="color: #555; line-height: 1.6;">
            You requested a password reset. Click the button below to choose a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: linear-gradient(to right, #d946ef, #f97316); color: white; padding: 14px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; line-height: 1.6;">
            This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
          
          <p style="color: #888; font-size: 14px;">
            Or copy this link: <br/>
            <a href="${resetLink}" style="color: #d946ef; word-break: break-all;">${resetLink}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="color: #aaa; font-size: 12px; text-align: center;">
            GiftFlick — The gift that makes people feel something.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://giftflick.vercel.app";

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to GiftFlick! 🎬✨",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #d946ef; margin: 0;">GiftFlick</h1>
            <p style="color: #666; margin-top: 5px;">AI-Powered Video Messages</p>
          </div>
          
          <h2 style="color: #333;">Welcome, ${name}! 🎉</h2>
          
          <p style="color: #555; line-height: 1.6;">
            You've got <strong>2 free video messages</strong> to try. Here's what you can do:
          </p>
          
          <ul style="color: #555; line-height: 2;">
            <li>🎂 Send a birthday video that makes someone cry happy tears</li>
            <li>💕 Create an anniversary message they'll watch 10 times</li>
            <li>🙏 Say thank you in a way they'll never forget</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/create" style="background: linear-gradient(to right, #d946ef, #f97316); color: white; padding: 14px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block;">
              Create Your First Video
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px;">
            Takes 30 seconds. No design skills needed. Pure magic. ✨
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="color: #aaa; font-size: 12px; text-align: center;">
            GiftFlick — The gift that makes people feel something.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Welcome email error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Welcome email send error:", error);
    return { success: false, error };
  }
}
