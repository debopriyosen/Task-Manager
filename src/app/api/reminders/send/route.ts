import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(req: Request) {
    try {
        if (!process.env.SENDGRID_API_KEY || !process.env.FROM_EMAIL) {
            console.warn("SendGrid keys not set. Skipping real email send.");
            return NextResponse.json({ success: true, dummy: true });
        }

        const { email, taskTitle, dueTime, priority } = await req.json();

        if (!email || !taskTitle) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const msg = {
            to: email, // use the provided email or a hardcoded one for testing
            from: process.env.FROM_EMAIL,
            subject: `Reminder: ${taskTitle}`,
            html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
          <h2 style="color: #4f46e5;">Task Reminder</h2>
          <p>You have an upcoming task: <strong>${taskTitle}</strong></p>
          <ul style="list-style-type: none; padding: 0;">
            <li><strong>Priority:</strong> <span style="text-transform: capitalize;">${priority || "Medium"}</span></li>
            ${dueTime ? `<li><strong>Due:</strong> ${new Date(dueTime).toLocaleString()}</li>` : ""}
          </ul>
          <div style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">View Dashboard</a>
          </div>
        </div>
      `,
        };

        await sgMail.send(msg);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}
