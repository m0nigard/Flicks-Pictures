let dataString = '/api/VW_MoviesWithActiveScreenings'
//for real dates, set currDate = new Date()
//the month in Date-objects starts at 0, stupidly
let currDate = new Date(2022, 3, 22)
let fwCurrDate = new Date(currDate)
let currDateSelectorVal

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
    let image = '/image/images-movies/' + element.imagePath
    let title = element.title
    html += `<a href="/movie-details?id=${element.id}" class="movie-link"><img class="movie-poster" src="${image}" alt="${title}"></a>`
  });
  document.querySelector(cssSelector).innerHTML = html;
}

//top level func for movies.js
async function start() {
  setDates()
  processData('/api/VW_MoviesWithActiveScreenings')
}

//set max and min dates for the datepicker
function setDates() {
  fwCurrDate.setDate(fwCurrDate.getDate() + (4 * 7))
  document.querySelector('#date_selector').max =
    dateStringFormatter(fwCurrDate.getFullYear() + '-' + (fwCurrDate.getMonth() + 1) + '-' + fwCurrDate.getDate())
  document.querySelector('#date_selector').min =
    dateStringFormatter(currDate.getFullYear() + '-' + (currDate.getMonth() + 1) + '-' + currDate.getDate())
}

//format date to string 
function dateStringFormatter(dateString) {
  if ((currDate.getMonth() + 1) >= 10 && currDate.getDay() < 10) {
    dateString = dateString.slice(0, 8) + '0' + dateString.slice(8)
  } else if (currDate.getDate() >= 10 && (currDate.getMonth() + 1) < 10) {
    dateString = dateString.slice(0, 5) + '0' + dateString.slice(5)
  } else if (currDate.getDate() < 10 && (currDate.getMonth() + 1) < 10) {
    dateString = dateString.slice(0, 5) + '0' + dateString.slice(5)
    dateString = dateString.slice(0, 8) + '0' + dateString.slice(8)
  }
  return dateString
}

async function processData(dataString, selectorValueString) {
  //fetch data, convert to strings and render selectbox
  let processedData = (await getData(dataString))

  //if date is picked, filter accordingly
  //else, show all movies on age group
  if (!!selectorValueString) {
    let screeningData = (await getData('/api/Screening'))
    let newProcessedData = Array()
    for (let x in processedData) {
      for (let y in screeningData) {
        if (processedData[x].id === screeningData[y].movieId) {
          if (JSON.stringify(screeningData[y].date).includes(selectorValueString)) {
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

//handle the selectbox for age group being changed
function ageGroupSelectBoxHandler(selector) {
  switch (selector.value) {
    case 'all': dataString = '/api/VW_MoviesWithActiveScreenings'
      break
    case 'kids': dataString = '/api/VW_MoviesAG_7'
      break
    case 'adult': dataString = '/api/VW_MoviesAG_15'
      break
    case 'youth': dataString = '/api/VW_MoviesAG_11'
      break
  }
  processData(dataString, currDateSelectorVal)
}

//handle the datepicker being changed
function datePickerHandler(selector) {
  currDateSelectorVal = (selector.value).toString()
  processData(dataString, currDateSelectorVal)
}