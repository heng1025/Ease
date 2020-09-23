var body = $("body");

$(function () {
    "use strict";
    search();
    featured();
    video();
    gallery();
    table();
    social();
    copyright();
    mobileMenu();
});

document.addEventListener("lazyloaded", function (e) {
    "use strict";
    var options = {
        disableParallax: /iPad|iPhone|iPod|Android/,
        disableVideo: /iPad|iPhone|iPod|Android/,
        speed: 0.1,
    };

    if ($(e.target).parent(".site-cover").length) {
        $(e.target).parent().jarallax(options).addClass("initialized");
    }
});

function search() {
    "use strict";
    var searchInput = $(".search-field");
    var searchButton = $(".search-button");
    var searchResult = $(".search-result");

    var url =
        siteUrl +
        "/ghost/api/v2/content/posts/?key=" +
        themeOptions.search_key +
        "&limit=all&fields=id,title,excerpt,url,updated_at,visibility&order=updated_at%20desc&formats=plaintext";
    var indexDump = JSON.parse(localStorage.getItem("ease_search_index"));
    var index;

    elasticlunr.clearStopWords();

    localStorage.removeItem("ease_index");
    localStorage.removeItem("ease_last");

    function update(data) {
        data.posts.forEach(function (post) {
            index.addDoc(post);
        });

        localStorage.setItem("ease_search_index", JSON.stringify(index));
        localStorage.setItem("ease_search_last", data.posts[0].updated_at);
    }

    if (
        !indexDump ||
        themeOptions.search_migration !=
            localStorage.getItem("ease_search_migration")
    ) {
        $.get(url, function (data) {
            if (data.posts.length > 0) {
                index = elasticlunr(function () {
                    this.addField("title");
                    this.addField("plaintext");
                    this.setRef("id");
                });

                update(data);
                if (typeof themeOptions.search_migration != "undefined") {
                    localStorage.setItem(
                        "ease_search_migration",
                        themeOptions.search_migration
                    );
                }
            }
        });
    } else {
        index = elasticlunr.Index.load(indexDump);

        $.get(
            url +
                "&filter=updated_at:>'" +
                localStorage
                    .getItem("ease_search_last")
                    .replace(/\..*/, "")
                    .replace(/T/, " ") +
                "'",
            function (data) {
                if (data.posts.length > 0) {
                    update(data);
                }
            }
        );
    }

    searchInput.on("keyup", function (e) {
        var result = index.search(e.target.value, { expand: true });
        var output = "";

        result.forEach(function (post) {
            output +=
                '<div class="search-result-row">' +
                '<a class="search-result-row-link" href="' +
                post.doc.url +
                '">' +
                '<div class="search-result-row-title">' +
                post.doc.title +
                '</div><div class="search-result-row-excerpt">' +
                post.doc.excerpt +
                "</div></a>" +
                "</div>";
        });

        searchResult.html(output);

        if (e.target.value.length > 0) {
            searchButton.addClass("search-button-clear");
        } else {
            searchButton.removeClass("search-button-clear");
        }
    });

    $(".search-form").on("submit", function (e) {
        e.preventDefault();
    });

    searchButton.on("click", function () {
        if ($(this).hasClass("search-button-clear")) {
            searchInput.val("").focus().keyup();
        }
    });

    $(document).keyup(function (e) {
        if (e.keyCode === 27) {
            searchInput.val("").focus().keyup();
        }
    });
}

function featured() {
    "use strict";
    $(".featured-posts").owlCarousel({
        dots: false,
        margin: 30,
        nav: true,
        navText: [
            '<i class="icon icon-chevron-left"></i>',
            '<i class="icon icon-chevron-right"></i>',
        ],
        responsive: {
            0: {
                items: 1,
            },
            768: {
                items: 3,
            },
            992: {
                items: 4,
            },
        },
    });
}

function video() {
    "use strict";
    $(".post-content").fitVids();
}

function gallery() {
    "use strict";
    var images = document.querySelectorAll(".kg-gallery-image img");

    images.forEach(function (image) {
        var container = image.closest(".kg-gallery-image");
        var width = image.attributes.width.value;
        var height = image.attributes.height.value;
        var ratio = width / height;
        container.style.flex = ratio + " 1 0%";
    });
}

function table() {
    "use strict";
    if (body.hasClass("post-template") || body.hasClass("page-template")) {
        var tables = $(".post-content").find(".table");
        tables.each(function (_, table) {
            var labels = [];

            $(table)
                .find("thead th")
                .each(function (_, label) {
                    labels.push($(label).text());
                });

            $(table)
                .find("tr")
                .each(function (_, row) {
                    $(row)
                        .find("td")
                        .each(function (index, column) {
                            $(column).attr("data-label", labels[index]);
                        });
                });
        });
    }
}

function social() {
    "use strict";
    var data = {
        facebook: { name: "Facebook", icon: "facebook" },
        twitter: { name: "Twitter", icon: "twitter" },
        instagram: { name: "Instagram", icon: "instagram" },
        dribbble: { name: "Dribbble", icon: "dribbble" },
        behance: { name: "Behance", icon: "behance" },
        github: { name: "GitHub", icon: "github-circle" },
        linkedin: { name: "LinkedIn", icon: "linkedin" },
        vk: { name: "VK", icon: "vk" },
        rss: { name: "RSS", icon: "rss" },
    };
    var links = themeOptions.social_links;
    var output = "";

    for (var key in links) {
        if (links[key] != "") {
            output +=
                '<a class="footer-social-item" href="' +
                links[key] +
                '" target="_blank"><i class="icon icon-' +
                data[key]["icon"] +
                '"></i></a>';
        }
    }

    $(".footer-social").html(output);
}

function copyright() {
    "use strict";
    if (themeOptions.copyright != "") {
        $(".copyright").html(themeOptions.copyright);
    }
}

function mobileMenu() {
    "use strict";
    $(".burger").on("click", function () {
        $("body").toggleClass("menu-opened");
    });
}
