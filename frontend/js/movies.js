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
    //fetch data, convert to strings and render selectbox
    let processedData = (await getData('/api/VW_MoviesWithActiveScreenings'))
    renderList('.movies', processedData)
  
  }