//stack: db (sqlite) <--> backend (index.js) <--> restapi (rest-api.js) <--> frontend (index.html + style.css + this)

//id of movie
let id = 0;

//rendering obj to HTML
async function renderMovieDetails(cssSelector, obj) {
  //build HTML container
  let html = ''
  let outputGenres = "N/A", outputActors = "N/A", outputProdc = "N/A"
  let youtubeID = "N/A", outputReviews = "N/A"

  try {
    youtubeID = obj.youtubeTrailer.substring(16)
    let genresJson = JSON.parse(obj.genres)
    let actorsJson = JSON.parse(obj.actors)
    let prodcJson = JSON.parse(obj.productionCountries)
    let reviewsJson = JSON.parse(obj.reviewSources)
    outputReviews = reviewHTMLBuilder(reviewsJson)

    outputGenres = jsonFormatter(genresJson)
    outputActors = jsonFormatter(actorsJson)
    outputProdc = jsonFormatter(prodcJson)

  } catch { (console.error("Error, Some JSON data is missing..")) }

  let runtime = runtimeFormatter(obj.minuteLength)



  html += `
      <iframe
      id="video"
      height="315"
      src="https://www.youtube-nocookie.com/embed/${youtubeID}?rel=0&amp;controls=0&amp;showinfo=0"
      frameborder="0"
      allowfullscreen="">
      </iframe>

    <img class="movie-details-image" src="./image/images-movies/${obj.imagePath}">

    <div class="movie_details_title">
    <h2 class="movie_title">${obj.title} (${obj.productionYear})</h2>
    <a id="m_details_book_tickets-button" href="#">Book tickets</a>
    </div>
    </br>

    <p>${obj.description}</p>
    </br><p>${obj.ageGroup}+</p>
  
      <div class="movie-desc-details">
         <table class="movie-desc-table">
          <tr>
            <th>Director:</th>
            <td>${obj.director}</td>
          </tr>
          <tr>
            <th>Genre:</th>
            <td>${outputGenres}</td>
          </tr>
          <tr>
            <th>Actors:</th>
            <td>${outputActors}</td>
          </tr>
          <tr>
            <th>Run time:</th>
            <td>${runtime}</td>
          </tr>
          <tr>
            <th>Languages:</th>
            <td>${obj.language}</td>
          </tr>
          <tr>
            <th>Subtitles:</th>
            <td>${obj.languageSubtitle}</td>
          </tr>
          <tr>
            <th>Production countries:</th>
            <td>${outputProdc}</td>
          </tr>
        </table><br>
        <h2>Reviews</h2>
        <p>${outputReviews}</p>
        </div>

      `

  document.querySelector(cssSelector).innerHTML = html;
}

//custom method to format json data to more readable format for html display
function jsonFormatter(jsonData) {
  let formattedJsonData = ""

  for (let i = 0; i < jsonData.length; i++) {
    formattedJsonData += jsonData[i].name
    if (i != jsonData.length - 1) {
      formattedJsonData += ", "
    }
  }
  return formattedJsonData
}

function reviewHTMLBuilder(jsonData) {
  let htmlBuilder = ''

  for (let i = 0; i < jsonData.length; i++) {

    let stars = JSON.stringify(jsonData[i].stars)
    let source = JSON.stringify(jsonData[i].source).replace(/['"]+/g, '')

    let maxStars = JSON.stringify(jsonData[i].max)
    let paddingStars = maxStars - stars
    let starBuilder = ''

    // Rendering correct amounts of stars
    while (stars--) starBuilder += '&#11088'
    while (paddingStars--) starBuilder += '&#9734'

    htmlBuilder += `${starBuilder}<p>${source}</p>
    <p>${JSON.stringify(jsonData[i].quote)}</p>
    
    `
    if (i != jsonData.length - 1) {
      htmlBuilder += "<br>"
    }
  }
  return htmlBuilder
}

async function startMD(params) {
  id = params.get('id');
  await processDataMD('/api/VW_MoviesDetails/' + id)
  await processDataModal('/api/VW_UpcomingScreeningsPerMovie/' + id)
  addListenerToBookButton()
}

async function processDataMD(dataString) {
  let processedData = (await getData(dataString))
  renderMovieDetails('.movie-details', processedData, id)
}

async function processDataModal(dataString) {
  let processedData = (await getData(dataString))
  setupBookingModal(processedData, id)
}

function addListenerToBookButton() {
  document.getElementById("m_details_book_tickets-button").addEventListener('click', async event => {
    document.getElementById("myModal").style.display = "block";  // Show Modal
  })
}

function runtimeFormatter(runtime){
  let runtimeHours = (runtime / 60)
  let runtimeRHours = Math.floor(runtimeHours)
  let runtimeMinutes = Math.round((runtimeHours - runtimeRHours) * 60)

  return runtimeRHours + " hour(s) " + runtimeMinutes + " minutes"
}