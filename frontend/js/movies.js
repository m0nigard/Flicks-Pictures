//stack: db (sqlite) <--> backend (index.js) <--> restapi (rest-api.js) <--> frontend (index.html + style.css + this)
let dateSelect = 'all'
let dataString = '/api/Movie'

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
  if (dateSelect !== 'all') {
    let screeningData = (await getData('/api/Screening'))
    //console.log(JSON.stringify(screeningData))
    let newProcessedData = Array()
    for (let x in processedData) {
      for (let y in screeningData) {
        if (processedData[x].id === screeningData[y].movieId) {
          if (JSON.stringify(screeningData[y].date).includes(dateSelect)) {
            newProcessedData.push(processedData[x])
          }
        }
      }
    }
    renderList('.movies', newProcessedData)
  } else {
    renderList('.movies', processedData)
  }
}

function selectboxHandler(selector) {
  switch (selector.value) {
    case 'all': dataString = '/api/Movie'
      break
    case 'kids': dataString = '/api/VW_MoviesAG_7'
      break
    case 'adult': dataString = '/api/VW_MoviesAG_15'
      break
    case 'youth': dataString = '/api/VW_MoviesAG_11'
      break
    default: dataString = '/api/Movie'
      break
  }
  processData(dataString)
}

function dateSelectboxHandler(selector) {
  switch (selector.value) {
    case 'all': dateSelect = 'all'
      break
    case 'today': dateSelect = '2022-04-22'
      break
    case '2022-04-23': dateSelect = '2022-04-23'
      break
    default: dateSelect = 'all'
  }
  processData(dataString)
}