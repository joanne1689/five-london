const PRERENDER_TOKEN = process.env.PRERENDER_TOKEN;
const PRERENDER_URL = 'https://service.prerender.io';

function isBot(userAgent) {
  if (!userAgent) return false;
  
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
    'quora link preview',
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
    'google page speed',
    'qwantify',
    'pinterestbot',
    'bitrix link preview',
    'xing-contenttabreceiver',
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
  
  const ua = userAgent.toLowerCase();
  return botPatterns.some(pattern => ua.includes(pattern));
}

function shouldPrerender(req) {
  const userAgent = req.headers['user-agent'] || '';
  const bufferAgent = req.headers['x-bufferbot'];
  const escapedFragment = req.query && req.query._escaped_fragment_ !== undefined;
  
  return isBot(userAgent) || bufferAgent || escapedFragment;
}

export default async function handler(req, res) {
  if (!shouldPrerender(req)) {
    res.status(404);
    return res.end();
  }

  if (!PRERENDER_TOKEN) {
    console.error('PRERENDER_TOKEN is not set');
    return res.status(500).json({ error: 'Prerender token not configured' });
  }

  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const url = `${protocol}://${host}${req.url}`;

  try {
    const prerenderUrl = `${PRERENDER_URL}/render?token=${PRERENDER_TOKEN}&url=${encodeURIComponent(url)}`;
    
    const response = await fetch(prerenderUrl, {
      headers: {
        'User-Agent': req.headers['user-agent'] || '',
      },
    });

    if (!response.ok) {
      console.error(`Prerender.io error: ${response.status} ${response.statusText}`);
      return res.status(response.status).send(await response.text());
    }

    const html = await response.text();
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    
    return res.status(200).send(html);
  } catch (error) {
    console.error('Prerender.io fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch prerendered content' });
  }
}
