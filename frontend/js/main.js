// Import other js files here

// Listener to direct to Router for navigation
document.querySelector('body').addEventListener('click', function (event) {
  let aTag = event.target.closest('a');
  if (!aTag) { return; }

  let href = aTag.getAttribute('href');

  // check if external link then open in a new window
  if (href.indexOf('http') === 0) {
    aTag.setAttribute('target', '_blank');
    return;
  }

  // Prevent browser reload
  event.preventDefault();

  // Push to browser history stack
  history.pushState(null, null, href);

  // Don't route on # links, but put in history
  if (href === '#') { return; }

  router();
});

// Change active link in top-nav
function makeMenuChoiceActive(route) {
  let aTagsInNav = document.querySelectorAll('.top-nav a');
  for (let aTag of aTagsInNav) {
    aTag.classList.remove('active');
    let href = aTag.getAttribute('href');
    if (href === route) {
      aTag.classList.add('active');
    }
  }
}

// Page router
async function router() {
  // Get URL params that can be send to other pages
  let url = document.URL;
  let searchParams;
  if (url.includes('?')) {
    let paramsString = url.substring(url.indexOf('?') + 1);
    searchParams = new URLSearchParams(paramsString);
  }

  let route = location.pathname;
  makeMenuChoiceActive(route);
  // transform route to be a path to a partial
  route = route === '/' ? '/start' : route;
  route = '/partials' + route + '.html';
  // load the content from the partial
  let content = await (await fetch(route)).text();
  // if no content found then load the start page
  content.includes('<title>Error</title>') && location.replace('/');
  // replace the content of the main element
  document.querySelector('.main-content').innerHTML = content;
  // run the productLister function (in another file)
  // if the route is '/partials/products.html';
  switch (route) {
    case '/partials/movies.html':
      start();
      break;
    case '/partials/movie-details.html':
      startMD(searchParams);  // On the other side, retrieve with: params.get('id')
      break;
    case '/partials/tickets.html':
      loadBookingPage();
      break;
  }
}

// Call router on browser back/forward
window.addEventListener('popstate', router);

router();
setupLoggedInUser();   // Function from userLogin.js to find logged on user on page start