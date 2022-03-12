//stack: db (sqlite) <--> backend (index.js) <--> restapi (rest-api.js) <--> frontend (index.html + style.css + this)

//id of movie
let id = 0;

//rendering obj to HTML
function renderMovieDetails(cssSelector, obj) {
  //build HTML container
  let html = ''
  let outputGenres = "null", outputActors = "null", outputProdc = "null"
  let youtubeID = "null"

  try{
    let genresJson = JSON.parse(obj.genres)
    let actorsJson = JSON.parse(obj.actors)
    let prodcJson = JSON.parse(obj.productionCountries)
  
    outputGenres = jsonFormatter(genresJson)
    outputActors = jsonFormatter(actorsJson)
    outputProdc = jsonFormatter(prodcJson)
  }catch{(console.error("Error, Some JSON data is missing.."))}

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
    <p><h1>${obj.title} (${obj.productionYear})</h1></p>
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
            <td>${outputGenres}</td>
          </tr>
          <tr>
            <th>Actors:</th>
            <td>${outputActors}</td>
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
            <td>${outputProdc}</td>
          </tr>
        </table> 
        </div>
      `
      
      document.querySelector(cssSelector).innerHTML = html;
}

//custom method to format json data to more readable format for html display
function jsonFormatter(jsonData){
  let formattedJsonData = ""

  for (let i = 0; i < jsonData.length; i++){
    formattedJsonData += jsonData[i].name
    if (i != jsonData.length - 1){
      formattedJsonData += ", "
    }
  }
  return formattedJsonData
}

async function startMD(params) {
  id = params.get('id');
  processDataMD('/api/VW_MoviesDetails/' + id)
}

async function processDataMD(dataString) {
  let processedData = (await getData(dataString))
  renderMovieDetails('.movie-details', processedData, id)
}