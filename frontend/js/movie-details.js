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
    let html = 'placeholder'

    document.querySelector(cssSelector).innerHTML = html;
    
  }
  
  async function startMD() {
    //processData('/api/VW_MoviesWithActiveScreenings')
    document.innerHTML = 'test'
  }
  
  async function processData(dataString) {
    //fetch data, convert to strings and render selectbox
    let processedData = (await getData(dataString))
    renderList('.movies', processedData)
  }