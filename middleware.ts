export default async function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  
  const botPatterns = [
    'googlebot',
    'bingbot',
    'slurp',
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'sogou',
    'exabot',
    'facebot',
    'ia_archiver',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora',
    'showyoubot',
    'outbrain',
    'pinterest',
    'slackbot',
    'vkShare',
    'W3C_Validator',
    'whatsapp',
    'flipboard',
    'tumblr',
    'bitlybot',
    'skypeuripreview',
    'nuzzel',
    'discordbot',
    'google.*page.*speed',
    'qwantify',
    'pinterestbot',
    'bitrix',
    'link.*preview',
    'xing',
    'chrome-lighthouse',
    'applebot',
    'yandex',
    'calendlybot',
    'zoomindexbot',
    'semrushbot',
    'dotbot',
    'ahrefsbot',
    'mj12bot',
    'megaindex',
    'prerender',
  ];
  
  const isBot = botPatterns.some(pattern => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(userAgent);
  });
  
  const bufferAgent = request.headers.get('x-bufferbot');
  const escapedFragment = url.searchParams.has('_escaped_fragment_');
  
  if (isBot || bufferAgent || escapedFragment) {
    const PRERENDER_TOKEN = process.env.PRERENDER_TOKEN;
    const PRERENDER_URL = 'https://service.prerender.io';
    
    if (!PRERENDER_TOKEN) {
      console.error('PRERENDER_TOKEN is not set in middleware');
    } else {
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host;
      const fullUrl = `${protocol}://${host}${url.pathname}${url.search}`;
      
      try {
        const prerenderApiUrl = `${PRERENDER_URL}/render?token=${PRERENDER_TOKEN}&url=${encodeURIComponent(fullUrl)}`;
        
        const response = await fetch(prerenderApiUrl, {
          headers: {
            'User-Agent': userAgent,
          },
        });
        
        if (response.ok) {
          const html = await response.text();
          return new Response(html, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=300, s-maxage=300',
            },
          });
        }
      } catch (error) {
        console.error('Prerender middleware error:', error);
      }
    }
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};

