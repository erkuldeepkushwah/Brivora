(function() {
  var base = location.pathname.indexOf('/Brivora') === 0 ? '/Brivora' : '';

  function u(path) { return base + path; }

  var targets = {
    home: '/',
    about: '/about/',
    services: '/service/',
    caseStudies: '/case-studies/',
    course: '/course/',
    blog: '/blog/',
    contact: '/contact/',
    login: '/login/',
    logos: '/logs/'
  };

  var map = {
    '': targets.home,
    '/': targets.home,
    '/home': targets.home,
    '/home/': targets.home,
    '/home-page-1/': targets.home,
    '/home-page-1': targets.home,
    '/home-2/': targets.home,
    '/home-2': targets.home,
    '/about/': targets.about,
    '/about': targets.about,
    '/services/': targets.services,
    '/services': targets.services,
    '/our-services/': targets.services,
    '/our-services': targets.services,
    '/case-studies/': targets.caseStudies,
    '/case-studies': targets.caseStudies,
    '/cases-studies-02/': targets.caseStudies,
    '/cases-studies-02': targets.caseStudies,
    '/case-studies-03/': targets.caseStudies,
    '/case-studies-03': targets.caseStudies,
    '/more/case-cards/': targets.course,
    '/more/case-cards': targets.course,
    '/case-cards': targets.course,
    '/case-cards/': targets.course,
    '/course': targets.course,
    '/course/': targets.course,
    '/courses': targets.course,
    '/courses/': targets.course,
    '/login': targets.login,
    '/login/': targets.login,
    '/blog/': targets.blog,
    '/blog': targets.blog,
    '/blog02/': targets.blog,
    '/blog02': targets.blog,
    '/contact/': targets.contact,
    '/contact': targets.contact,
    '/contact02/': targets.contact,
    '/contact02': targets.contact,
    '/more/logos/': targets.logos,
    '/more/logos': targets.logos,
    '/logos/': targets.logos,
    '/logos': targets.logos
  };

  var domain = 'https://the7.io/fse-business';

  function rewriteLinks() {
    document.querySelectorAll('a[href]').forEach(function(a) {
      var href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith(domain)) {
        var pathPart = href.substring(domain.length);
        if (map[pathPart] !== undefined) {
          a.setAttribute('href', map[pathPart]);
        } else if (pathPart.startsWith('/services/')) {
          a.setAttribute('href', targets.services);
        } else if (pathPart.startsWith('/case-studies')) {
          a.setAttribute('href', targets.caseStudies);
        } else if (pathPart.startsWith('/blog')) {
          a.setAttribute('href', targets.blog);
        } else if (pathPart.startsWith('/contact')) {
          a.setAttribute('href', targets.contact);
        } else if (pathPart.startsWith('/about')) {
          a.setAttribute('href', targets.about);
        } else if (pathPart.startsWith('/course')) {
          a.setAttribute('href', targets.course);
        }
      }
    });

    document.querySelectorAll('img.custom-logo, .wp-block-site-logo img').forEach(function(img) {
      img.setAttribute('src', u('/public/logo.png'));
      img.setAttribute('alt', 'Brivora');
      img.style.maxHeight = '48px';
      img.style.width = 'auto';
      img.style.objectFit = 'contain';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rewriteLinks);
  } else {
    rewriteLinks();
  }
})();
