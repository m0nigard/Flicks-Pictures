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
  //build HTML table
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
  document.querySelector(cssSelector).innerHTML = htmlTable;
}

function renderSelectBox(cssSelector, list, eventHandlerFunc) {
  //build a selectbox based on the values in the list (array)
  let htmlSelectBox = '<select>' + list.map(item => '<option>' + item + '</option>').join('') + '</select>'

  //grab element with cssSelector and replace with newly created table
  document.querySelector(cssSelector).innerHTML = htmlSelectBox

  //grab the selectbox
  let selectBox = document.querySelector(cssSelector + ' select')

  //add an onChange eventlistener
  selectBox.addEventListener('change', eventHandlerFunc)

  //call the eventlistener once initially
  eventHandlerFunc({ target: selectBox })

}

async function reactOnChange(e) {
  let tableOrView = e.target.value.split(' ')[1]
  //get data from rest api and render the HTML table 
  renderList('.data', await getData('/api/' + tableOrView))
}

async function start() {
  //fetch data, convert to strings and render selectbox
  let processedData = (await getData('/api/tablesAndViews')).map(item => item.type + ': ' + item.name).sort()
  renderSelectBox('.select_holder', processedData, reactOnChange)

}
start()