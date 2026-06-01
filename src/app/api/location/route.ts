import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const country = req.headers.get("cf-ipcountry") || "unknown";
  const city = req.headers.get("cf-ipcity") || "unknown";
  const region = req.headers.get("cf-region") || "unknown";

  // If in development or headers are missing/unknown
  if (country === "unknown" || country === "XX") {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          country: data.country_name || "United States",
          city: data.city || "unknown",
          region: data.region || "unknown",
          countryCode: data.country || "US"
        });
      }
    } catch {
      // ignore
    }
  }

  // Try mapping country code to full name using Intl.DisplayNames
  let countryName = country;
  try {
    if (country && country !== "unknown") {
      const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
      countryName = displayNames.of(country) || country;
    }
  } catch {
    // fallback
  }

  return NextResponse.json({
    country: countryName,
    city: city !== "unknown" ? city : "",
    region: region !== "unknown" ? region : "",
    countryCode: country
  });
}
