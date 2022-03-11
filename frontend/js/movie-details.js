//stack: db (sqlite) <--> backend (index.js) <--> restapi (rest-api.js) <--> frontend (index.html + style.css + this)

//id of movie
let id = 0;

//rendering obj to HTML
function renderMovieDetails(cssSelector, obj) {
  //build HTML container
  let html = ''
  let youtubeID = obj.youtubeTrailer.substring(16)

  try{
      html += `
      <iframe
      id="video"
      height="315"
      src="https://www.youtube-nocookie.com/embed/${youtubeID}?rel=0&amp;controls=0&amp;showinfo=0"
      frameborder="0"
      allowfullscreen="">
      </iframe>

    <img class="movie-details-image" src="./image/images-movies/${obj.imagePath}">
    <div class="movie-desc">
    <p><h1>${obj.title} (${obj.productionYear}</h1></p>
    <p>${obj.description}</p>
    </br><p>${obj.ageGroup}+</p>
      </div>
      <div class="movie-desc-details">
         <table class="movie-desc-table">
          <tr>
            <th>Director:</th>
            <td>${obj.director}</td>
          </tr>
          <tr>
            <th>Genre:</th>
            <td>${obj.genres}</td>
          </tr>
          <tr>
            <th>Actors:</th>
            <td>${obj.actors}</td>
          </tr>
          <tr>
            <th>Length:</th>
            <td>${obj.minuteLength} minutes</td>
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
            <td>${obj.productionCountries}</td>
          </tr>
        </table> 
        </div>
      `
    }catch{(console.log("Some attributes could not be loaded by the API"))}
  document.querySelector(cssSelector).innerHTML = html;
}

async function startMD(params) {
  id = params.get('id');
  processDataMD('/api/VW_MoviesDetails/' + id)
}

async function processDataMD(dataString) {
  let processedData = (await getData(dataString))
  renderMovieDetails('.movie-details', processedData, id)
}