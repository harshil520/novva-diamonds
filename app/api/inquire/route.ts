import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, country, inquiryType, diamondId, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields." },
        { status: 400 }
      );
    }

    const referenceId = `NOVVA-${Date.now().toString(36).toUpperCase()}`;

    // If Web3Forms Access Key is provided in environment, submit
    const accessKey =
      process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || siteConfig.web3forms.defaultAccessKey;

    if (accessKey && accessKey !== "optional-web3forms-access-key") {
      try {
        await fetch(siteConfig.web3forms.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: accessKey,
            subject: `New Lead: [${inquiryType || "General"}] from ${name} (${country || "Global"})`,
            from_name: "Novva Diamonds Lead System",
            name,
            email,
            phone: phone || "Not provided",
            country: country || "Not specified",
            inquiry_type: inquiryType,
            diamond_id: diamondId || "None",
            message,
            reference_id: referenceId,
          }),
        });
      } catch (err) {
        console.error("Web3Forms transmission error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      referenceId,
      message:
        "Your inquiry has been received by our Surat export desk. A diamond specialist will contact you within our trading hours window.",
    });
  } catch (error) {
    console.error("Inquiry API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please contact us directly via WhatsApp." },
      { status: 500 }
    );
  }
}
