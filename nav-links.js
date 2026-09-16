(function() {
  const map = {
    '': '/',
    '/': '/',
    '/home': '/',
    '/home/': '/',
    '/home-page-1/': '/',
    '/home-2/': '/',
    '/about/': '/about',
    '/about': '/about',
    '/services/': '/services',
    '/services': '/services',
    '/our-services/': '/services',
    '/our-services': '/services',
    '/case-studies/': '/course',
    '/case-studies': '/course',
    '/cases-studies-02/': '/course',
    '/case-studies-03/': '/course',
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
    '/blog/': '/blog',
    '/blog': '/blog',
    '/blog02/': '/blog',
    '/blog02': '/blog',
    '/contact/': '/contact',
    '/contact': '/contact',
    '/contact02/': '/contact',
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
