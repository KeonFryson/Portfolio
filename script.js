// Wait for the document to load before running the script 
(function ($) {
  
  // We use some Javascript and the URL #fragment to hide/show different parts of the page
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#Linking_to_an_element_on_the_same_page

    // Function to load and display GitHub projects for KeonFryson
    function loadGitHubProjects() {
        var $container = $('#github-projects');
        if ($container.length === 0) return; // Only run if the container exists
        $container.html('<p>Loading projects...</p>');
        $.getJSON('https://api.github.com/users/KeonFryson/repos?sort=updated', function (repos) {
            $container.empty();
            if (!repos.length) {
                $container.append('<p>No public projects found.</p>');
                return;
            }
            // Only include the specified repositories
            var allowedRepos = [
                "https://github.com/KeonFryson/END2502",
                "https://github.com/KeonFryson/Week-4"
            ];
            var filtered = repos.filter(function (repo) {
                return allowedRepos.includes(repo.html_url);
            });
            if (!filtered.length) {
                $container.append('<p>No matching projects found.</p>');
                return;
            }
            var $list = $('<ul></ul>');
            filtered.forEach(function (repo) {
                var $item = $('<li></li>');
                var $link = $('<a></a>')
                    .attr('href', repo.html_url)
                    .attr('target', '_blank')
                    .text(repo.name);
                $item.append($link);
                if (repo.description) {
                    $item.append(' – ' + repo.description);
                }
                $list.append($item);
            });
            $container.append($list);
        }).fail(function () {
            $container.html('<p>Could not load GitHub projects.</p>');
        });
    }

    $(document).ready(function () {
        $('.main-menu a').on('click', function (e) {
            var target = $(this).attr('href');
            if (target.startsWith('#')) {
                e.preventDefault();
                var $target = $(target);
                if ($target.length) {
                    $('html, body').animate({
                        scrollTop: $target.offset().top
                    }, 600); // 600ms for smooth scroll
                }
            }
        });
    });

    // Call the function when the document is ready
    $(function () {
        loadGitHubProjects();
    });


  
})(jQuery);
