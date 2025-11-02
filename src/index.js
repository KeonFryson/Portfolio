import indexHtml from './index.html';
import profileHtml from './profile.html';
import projectsHtml from './projects.html';
import contactHtml from './contact.html';
import styleCss from './style.css';
import scriptJs from './script.js';
import profileImg from './Profile.jpg';
import logoPng from './logo.png';

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname;

		// Serve HTML pages
		if (path === '/' || path === '/index.html') {
			return new Response(indexHtml, {
				headers: { 'Content-Type': 'text/html; charset=UTF-8' },
			});
		}
		if (path === '/profile.html') {
			return new Response(profileHtml, {
				headers: { 'Content-Type': 'text/html; charset=UTF-8' },
			});
		}
		if (path === '/projects.html') {
			return new Response(projectsHtml, {
				headers: { 'Content-Type': 'text/html; charset=UTF-8' },
			});
		}
		if (path === '/contact.html') {
			return new Response(contactHtml, {
				headers: { 'Content-Type': 'text/html; charset=UTF-8' },
			});
		}

		// Serve stylesheet
		if (path === '/style.css') {
			return new Response(styleCss, {
				headers: { 'Content-Type': 'text/css; charset=UTF-8' },
			});
		}

		// Serve JS
		if (path === '/script.js') {
			return new Response(scriptJs, {
				headers: { 'Content-Type': 'application/javascript; charset=UTF-8' },
			});
		}

		// Serve images
		if (path === '/Profile.jpg' || path === '/profile.jpg') {
			// profileImg is likely a base64 URL or a binary asset the bundler provides
			// If bundler returns a URL string, fetch that URL; otherwise return raw bytes.
			if (typeof profileImg === 'string') {
				return fetch(profileImg);
			}
			return new Response(profileImg, {
				headers: { 'Content-Type': 'image/jpeg' },
			});
		}
		if (path === '/logo.png' || path === '/Logo.png') {
			if (typeof logoPng === 'string') {
				return fetch(logoPng);
			}
			return new Response(logoPng, {
				headers: { 'Content-Type': 'image/png' },
			});
		}

		return new Response('Not found', { status: 404 });
	},
};
