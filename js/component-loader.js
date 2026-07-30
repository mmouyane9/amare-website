(function () {
  'use strict';

  function loadComponent(selector, url) {
    var el = document.querySelector(selector);
    if (!el) return Promise.resolve();
    var base = el.getAttribute('data-base');

    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('Failed to load ' + url);
        return r.text();
      })
      .then(function (html) {
        // If data-base is set, fix relative paths
        if (base) {
          html = html.replace(
            /(src|href)=["']((?!#|https?:\/\/|\/|mailto:|tel:|javascript:)[^"']+)["']/g,
            function (match, attr, path) {
              return attr + '="' + base + '/' + path + '"';
            }
          );
        }
        el.innerHTML = html;
      })
      .catch(function (err) {
        console.error('ComponentLoader:', err);
      });
  }

  window.loadComponent = loadComponent;
})();
