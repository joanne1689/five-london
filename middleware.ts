import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BOT_UA =
  /(googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit|twitterbot|linkedinbot|slackbot|whatsapp|telegrambot)/i;

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const ua = req.headers.get("user-agent") || "";

  // health check
  if (url.pathname === "/__probe") {
    return new Response("OK from Vercel Prerender Middleware");
  }

  // skip humans
  const isBot = BOT_UA.test(ua);
  if (!isBot) return NextResponse.next();

  const target = url.toString();

  const prerenderUrl = `https://service.prerender.io/${encodeURIComponent(
    target
  )}`;

  const resp = await fetch(prerenderUrl, {
    headers: {
      "X-Prerender-Token": process.env.PRERENDER_TOKEN!,
      "User-Agent": ua,
    },
  });

  return new Response(resp.body, {
    status: resp.status,
    headers: resp.headers,
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets|images).*)",
  ],
};
