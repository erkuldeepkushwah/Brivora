(function() {
  const map = {
    '': '/',
    '/': '/',
    '/home': '/',
    '/home/': '/',
    '/home-page-1/': '/',
    '/home-page-1': '/',
    '/home-2/': '/',
    '/home-2': '/',
    '/about/': '/about',
    '/about': '/about',
    '/services/': '/services',
    '/services': '/services',
    '/our-services/': '/services',
    '/our-services': '/services',
    '/case-studies/': '/case-studies',
    '/case-studies': '/case-studies',
    '/cases-studies-02/': '/case-studies',
    '/cases-studies-02': '/case-studies',
    '/case-studies-03/': '/case-studies',
    '/case-studies-03': '/case-studies',
    '/more/case-cards/': '/course',
    '/more/case-cards': '/course',
    '/case-cards': '/course',
    '/case-cards/': '/course',
    '/course': '/course',
    '/course/': '/course',
    '/courses': '/course',
    '/courses/': '/course',
    '/login': '/login',
    '/login/': '/login',
    '/dashboard': '/dashboard',
    '/dashboard/': '/dashboard',
    '/client-portal': '/dashboard',
    '/client-portal/': '/dashboard',
    '/portal': '/dashboard',
    '/portal/': '/dashboard',
    '/blog/': '/blog',
    '/blog': '/blog',
    '/blog02/': '/blog',
    '/blog02': '/blog',
    '/contact/': '/contact',
    '/contact': '/contact',
    '/contact02/': '/contact',
    '/contact02': '/contact',
    '/more/logos/': '/logos',
    '/more/logos': '/logos',
    '/logos/': '/logos',
    '/logos': '/logos'
  };

  const domain = 'https://the7.io/fse-business';

  function rewriteLinks() {
    document.querySelectorAll('a[href]').forEach(function(a) {
      const href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith(domain)) {
        const pathPart = href.substring(domain.length);
        if (map[pathPart] !== undefined) {
          a.setAttribute('href', map[pathPart]);
        } else if (pathPart.startsWith('/services/')) {
          a.setAttribute('href', '/services');
        } else if (pathPart.startsWith('/case-studies')) {
          a.setAttribute('href', '/case-studies');
        } else if (pathPart.startsWith('/blog')) {
          a.setAttribute('href', '/blog');
        } else if (pathPart.startsWith('/contact')) {
          a.setAttribute('href', '/contact');
        } else if (pathPart.startsWith('/about')) {
          a.setAttribute('href', '/about');
        } else if (pathPart.startsWith('/course')) {
          a.setAttribute('href', '/course');
        }
      }
    });

    // Ensure all logos point to /public/logo.png with Brivora branding
    document.querySelectorAll('img.custom-logo, .wp-block-site-logo img').forEach(function(img) {
      img.setAttribute('src', '/public/logo.png');
      img.setAttribute('alt', 'Brivora');
      img.style.maxHeight = '48px';
      img.style.width = 'auto';
      img.style.objectFit = 'contain';
    });

    // Ensure all images have no-referrer policy to bypass CDN hotlink restrictions
    document.querySelectorAll('img').forEach(function(img) {
      if (!img.getAttribute('referrerpolicy')) {
        img.setAttribute('referrerpolicy', 'no-referrer');
      }
    });

    // Hydrate any data-srcset images that are missing src
    document.querySelectorAll('img[data-srcset]').forEach(function(img) {
      var dataSrcset = img.getAttribute('data-srcset');
      if (dataSrcset) {
        if (!img.getAttribute('src')) {
          var firstUrl = dataSrcset.split(' ')[0].trim();
          img.setAttribute('src', firstUrl);
        }
        if (!img.getAttribute('srcset')) {
          img.setAttribute('srcset', dataSrcset);
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rewriteLinks);
  } else {
    rewriteLinks();
  }
})();
