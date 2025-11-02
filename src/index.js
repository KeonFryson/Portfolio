import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
	event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
	const req = event.request;
	const url = new URL(req.url);

	// Serve index.html for root
	if (url.pathname === '/') {
		const indexReq = new Request(url.origin + '/index.html', req);
		try {
			return await getAssetFromKV({ request: indexReq, waitUntil: event.waitUntil });
		} catch (err) {
			return new Response('Index not found', { status: 404 });
		}
	}

	// If request path contains no file extension, try path + .html (friendly tabs)
	if (!url.pathname.includes('.')) {
		const htmlCandidate = new Request(url.origin + url.pathname.replace(/\/$/, '') + '.html', req);
		try {
			return await getAssetFromKV({ request: htmlCandidate, waitUntil: event.waitUntil });
		} catch (err) {
			// fall through to try original request
		}
	}

	// Default: try to serve the requested asset (CSS, JS, images, HTML with extension)
	try {
		return await getAssetFromKV(event);
	} catch (err) {
		// Final fallback: return index.html (useful for SPA-like use) or show 404
		try {
			const fallback = new Request(url.origin + '/index.html', req);
			return await getAssetFromKV({ request: fallback, waitUntil: event.waitUntil });
		} catch (e) {
			return new Response('Not found', { status: 404 });
		}
	}
}
