import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BOT_UA =
  /(googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit|twitterbot|linkedinbot|slackbot|whatsapp|telegrambot|discordbot)/i;

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const ua = req.headers.get("user-agent") || "";

  // health check
  if (url.pathname === "/__probe") {
    return new Response("OK from Vercel Prerender Middleware", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  // skip humans
  const isBot = BOT_UA.test(ua);
  if (!isBot) return NextResponse.next();

  // call prerender.io
  const prerenderUrl = `https://service.prerender.io/${encodeURIComponent(
    url.toString()
  )}`;

  try {
    const prerenderResp = await fetch(prerenderUrl, {
      method: "GET",
      headers: {
        "X-Prerender-Token": process.env.PRERENDER_TOKEN!,
        "User-Agent": ua,
      },
    });

    return new Response(prerenderResp.body, {
      status: prerenderResp.status,
      headers: prerenderResp.headers,
    });
  } catch (err) {
    // if prerender fails, fall back to normal render
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets|images).*)",
  ],
};
