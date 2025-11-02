import indexHtml from './index.html';
 

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// Serve HTML page
		if (url.pathname === '/') {
			return new Response(indexHtml, {
				headers: { 'Content-Type': 'text/html; charset=UTF-8' },
			});
		}


	},
};
