import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
	event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
	const req = event.request;
	const url = new URL(req.url);

	// Serve index.html for root
	if (url.pathname === '/') {
		const indexReq = new Request(new URL('/index.html', req.url).toString(), req);
		try {
			return await getAssetFromKV({ request: indexReq, waitUntil: event.waitUntil });
		} catch (err) {
			return new Response('Index not found', { status: 404 });
		}
	}

	// Try to serve the requested asset (css/js/images/explicit html)
	try {
		return await getAssetFromKV({ request: req, waitUntil: event.waitUntil });
	} catch (err) {
		// If asset not found and path has no extension, try <path>.html
		if (!url.pathname.includes('.')) {
			const htmlPath = url.pathname.replace(/\/$/, '') + '.html';
			const htmlReq = new Request(new URL(htmlPath, req.url).toString(), req);
			try {
				return await getAssetFromKV({ request: htmlReq, waitUntil: event.waitUntil });
			} catch (e) {
				// fall through to SPA fallback
			}
		}

		// Final fallback: serve index.html (useful for SPA-style navigation)
		try {
			const fallback = new Request(new URL('/index.html', req.url).toString(), req);
			return await getAssetFromKV({ request: fallback, waitUntil: event.waitUntil });
		} catch (e) {
			return new Response('Not found', { status: 404 });
		}
	}
}
