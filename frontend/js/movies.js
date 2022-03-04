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
      console.log(list)
    //build HTML table

    let html = ''


    list.forEach(element => {
        console.log(element.imagePath)
        let image = '/image/images-movies/' + element.imagePath
        html += '<img class="movie-poster" src="' + image + '">'
    });



    document.querySelector(cssSelector).innerHTML = html;










    let htmlTable = '<table>'
  
    //add column names
    htmlTable += '<thead><tr>'
    for (let [key, value] of Object.entries(list[0])) { //just take the key names from the first item
      htmlTable += '<th class ="' + typeof value + '">' + key + '</th>'
    }
    htmlTable += '</thead></tr>'
  
    //add column data
    htmlTable += '<tbody>'
    for (let item of list) {
      htmlTable += '<tr>'
      for (let value of Object.values(item)) {
        htmlTable += '<td class="' + typeof value + '">' + value + '</td>'
      }
      htmlTable += '</tr>'
    }
    htmlTable += '</tbody></table>'
  
    //use cssSelector to grab an element and replace with table
    //document.querySelector(cssSelector).innerHTML = htmlTable;
  }
  

  
  async function start() {
    //fetch data, convert to strings and render selectbox
    let processedData = (await getData('/api/VW_MoviesWithActiveScreenings'))
    renderList('.movies', processedData)
  
  }