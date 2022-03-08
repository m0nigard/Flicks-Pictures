//stack: db (sqlite) <--> backend (index.js) <--> restapi (rest-api.js) <--> frontend (index.html + style.css + this)

async function getData(restRoute) {
  //get the data from the rest route
  let data = await fetch(restRoute)

  //deserialize json into live data struct
  let result = await data.json()
  return result
}

//rendering array of obj to HTML
function renderList(cssSelector, list) {
  //build HTML container
  let html = ''

  list.forEach(element => {
    //console.log(element.imagePath)
    let image = '/image/images-movies/' + element.imagePath
    let title = element.title
    html += '<img class="movie-poster" src="' + image + '" alt="' + title + '">'
  });
  document.querySelector(cssSelector).innerHTML = html;
}

async function start() {
  processData('/api/VW_MoviesWithActiveScreenings')
}

async function processData(dataString) {
  //fetch data, convert to strings and render selectbox
  let processedData = (await getData(dataString))
  renderList('.movies', processedData)
}

function selectboxHandler(selector) {
  let dataString = '/api/VW_MoviesWithActiveScreenings'
  switch (selector.value) {
    case 'all': dataString = '/api/VW_MoviesWithActiveScreenings'
      break
    case 'kids': dataString = '/api/VW_MoviesAG_7'
      break
    case 'adult': dataString = '/api/VW_MoviesAG_15'
      break
    case 'youth': dataString = '/api/VW_MoviesAG_11'
      break
    default: dataString = '/api/VW_MoviesWithActiveScreenings'
      break
  }
  processData(dataString)
}