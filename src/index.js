import indexHtml from './index.html';
import styleCss from './style.css';

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// Serve HTML page
		if (url.pathname === '/') {
			return new Response(indexHtml, {
				headers: { 'Content-Type': 'text/html; charset=UTF-8' },
			});
		}

		// Serve stylesheet
		if (url.pathname === '/style.css') {
			return new Response(styleCss, {
				headers: { 'Content-Type': 'text/css; charset=UTF-8' },
			});
		}

		return new Response('Not found', { status: 404 });
	},
};
