import { NextRequest, NextResponse } from "@vercel/edge";

export const config = {
  matcher: "/:path*",
};

export default async function middleware(req: NextRequest) {
  const ua = req.headers.get("user-agent")?.toLowerCase() || "";

  // List of bots Prerender should serve
  const botPattern =
    /(googlebot|bingbot|yandexbot|duckduckbot|slackbot|twitterbot|linkedinbot|facebookexternalhit|discordbot|embedly|quora link preview|pinterestbot|redditbot|applebot)/i;

  const isBot = botPattern.test(ua);

  if (!isBot) return NextResponse.next();

  // Rewrite bot requests → /api/prerender?target=<FULL_URL>
  const url = req.nextUrl.clone();
  const target = req.nextUrl.href;

  const apiUrl = new URL("/api/prerender", req.url);
  apiUrl.searchParams.set("target", target);

  return NextResponse.rewrite(apiUrl);
}
