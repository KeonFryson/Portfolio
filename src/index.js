import indexHtml from './index.html';
import profileHtml from './profile.html';
import projectsHtml from './projects.html';
import contactHtml from './contact.html';
import styleCss from './style.css';
import scriptJs from './script.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Serve HTML pages
    if (path === '/' || path === '/index.html') {
      return new Response(indexHtml, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
    }
    if (path === '/profile.html') return new Response(profileHtml, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
    if (path === '/projects.html') return new Response(projectsHtml, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
    if (path === '/contact.html') return new Response(contactHtml, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });

    // Serve CSS
    if (path === '/style.css') return new Response(styleCss, { headers: { 'Content-Type': 'text/css; charset=UTF-8' } });

    // Serve JS
    if (path === '/script.js') return new Response(scriptJs, { headers: { 'Content-Type': 'application/javascript; charset=UTF-8' } });

    // Serve public files (images, fonts, etc.)
    if (path.startsWith('/images/')) {
      try {
        const filePath = path.substring(1); // remove leading "/"
        const file = await env.ASSETS.get(filePath); // Workers Sites binding (see below)
        if (file) {
          return new Response(file.body, { headers: { 'Content-Type': file.contentType } });
        }
      } catch (err) {
        return new Response('File not found', { status: 404 });
      }
    }

    return new Response('Not found', { status: 404 });
  },
};
