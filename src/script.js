// Lightweight diagnostics & guards
console.log('script.js loaded');
window.addEventListener('error', function (e) {
    console.error('Unhandled error:', e.message, e.filename + ':' + e.lineno);
});

if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded. Ensure jQuery is included before script.js');
}

$(document).ready(function () {
    try {
        // helper: initialize project video elements (poster visible, controls off)
        function initProjectVideos() {
            $('.project-video').each(function () {
                try { this.pause(); this.currentTime = 0; } catch (e) { }
                $(this).prop('controls', false).show();
            });
        }

        // Smooth scroll for nav links that point to anchors on the same page
        $('header nav a').on('click', function (e) {
            var href = $(this).attr('href');
            if (!href) return;
            // If internal anchor on same page, handle it
            if (href.startsWith('#')) {
                e.preventDefault();
                var $target = $(href);
                if ($target.length) {
                    $('html, body').animate({ scrollTop: $target.offset().top }, 600);
                }
            }
            // otherwise allow normal navigation to other pages
        });

        // Phone formatting (if contact phone input exists)
        var $phone = $('#contactPhone');
        if ($phone.length) {
            $phone.on('input', function () {
                let value = $(this).val().replace(/\D/g, '').slice(0, 10);
                let formatted = '';
                if (value.length > 0) formatted = '(' + value.slice(0, 3);
                if (value.length >= 4) formatted += ') ' + value.slice(3, 6);
                if (value.length >= 7) formatted += '-' + value.slice(6, 10);
                $(this).val(formatted);
            });
        }

        // Contact form handler (if present)
        var $contactForm = $('#contactForm');
        if ($contactForm.length) {
            $contactForm.on('submit', function (e) {
                e.preventDefault();
                if (!this.checkValidity()) {
                    this.reportValidity();
                    return;
                }
                $('#contactResult').text('Sending...').css('color', '');

                const formData = new FormData();
                formData.append('access_key', '8b4081ef-d1fd-453f-8355-87fc76e4f870'); // Replace with real key
                formData.append('subject', 'New Contact Message from Portfolio');
                formData.append('name', $('#contactName').val());
                formData.append('email', $('#contactEmail').val());
                formData.append('phone', $('#contactPhone').val());
                formData.append('message', $('#contactMessage').val());

                fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
                    .then(async response => {
                        const json = await response.json();
                        if (response.ok && json.success) {
                            $('#contactResult').text('Message sent! Thank you.').css('color', 'green');
                            $('#contactForm')[0].reset();
                        } else {
                            $('#contactResult').text(json.message || 'Failed to send message.').css('color', 'red');
                        }
                    })
                    .catch(() => {
                        $('#contactResult').text('Something went wrong. Please try again.').css('color', 'red');
                    });
            });
        }

        // Delegate demo toggle -> supports dynamically injected cards
        $(document).on('click', '.toggle-demo', function () {
            var $card = $(this).closest('.project-card');
            var video = $card.find('.project-video').get(0);

            // Pause other videos and reset them to poster state
            $('.project-video').not(video).each(function () {
                try { this.pause(); this.currentTime = 0; } catch (e) { }
                $(this).prop('controls', false);
                $(this).closest('.project-card').find('.toggle-demo').text('Play Demo');
            });

            if (!video) return;

            if (video.paused) {
                $(video).prop('controls', true);
                try { video.currentTime = 0; video.play(); } catch (err) { console.warn('Video play prevented:', err); }
                $(this).text('Hide Demo');
                $('html, body').animate({ scrollTop: $(video).offset().top - 20 }, 400);
            } else {
                try { video.pause(); video.currentTime = 0; } catch (e) { }
                $(video).prop('controls', false);
                $(this).text('Play Demo');
            }
        });

        // Projects JSON loader (if a container exists)
        var $projContainer = $('#projectContainer');
        if ($projContainer.length) {
            fetch('projects/projects.json')
                .then(res => res.json())
                .then(projects => {
                    projects.forEach(p => {
                        const thumb = p.thumb || '';
                        const video = p.video || '';
                        const link = p.link || '#';
                        const title = p.title || 'Untitled';
                        const engine = p.engine || '';
                        const description = p.description || '';
                        const github = p.github || '#';

                        $projContainer.append(`
                            <div class="project-card">
                              <div class="media-wrapper">
                                <video class="project-video" preload="metadata" poster="${thumb}">
                                  <source src="${video}" type="video/mp4">
                                  <a href="${video}" target="_blank">Open demo</a>
                                </video>
                              </div>
                              <h3><a href="${link}" target="_blank" style="color:inherit;text-decoration:none;">${title}</a></h3>
                              <p>${engine}<br>${description}</p>
                              <div class="demo-controls">
                                <button class="toggle-demo">Play Demo</button>
                                <a class="demo-link" href="${github}" target="_blank">View on GitHub</a>
                              </div>
                            </div>
                        `);
                    });
                    initProjectVideos();
                })
                .catch(err => console.error('Error loading projects:', err));
        }

        // initialize any existing videos
        initProjectVideos();
    } catch (err) {
        console.error('Error in document ready handler:', err);
    }
});