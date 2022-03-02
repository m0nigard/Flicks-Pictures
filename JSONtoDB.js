// Import the better-sqlite3 module
const betterSqlite3 = require('better-sqlite3');

// Connect to a SQLite database
const db = betterSqlite3('./database/cinema.sqlite3');

// Collect movie data from nested JSON into Array
const arrayData = collectData(require('./JSON/movies_edit.json'))

// Build SQL statement and transfer to DB
DBtransfer(arrayData, 'Movie')

function DBtransfer(arrayData, ...tables) {
  let sql

  for (let i = 0; i < arrayData.length; i++) {
    sql = ""

    if (tables[0] === 'Movie') {
      sql = `
    INSERT INTO ${tables[0]} 
    (title, productionYear, minuteLength, language, description, 
      distributor, languageSubtitle, director, youtubeTrailer, genre, imagePath)
    VALUES ('`

      //PROBLEM: -->' i JSON-filerna skapar SQL syntax error
      sql += arrayData[i][0] + "', '"
      sql += arrayData[i][2] + "', "
      sql += arrayData[i][3]
      sql += ", '" + arrayData[i][6] + "', '"
      sql += arrayData[i][10] + "', '"
      sql += arrayData[i][5] + "', '"
      sql += arrayData[i][7] + "', '"
      sql += arrayData[i][8] + "', '"
      sql += arrayData[i][12] + "', '"
      sql += arrayData[i][4] + "', '"
      sql += arrayData[i][11] + "');"
      console.log(sql)
    }

    let stmt = db.prepare(sql)
    console.log(stmt.run())
  }
}


function collectData(jsonData) {
  let outerArray = Array()

  for (let i = 0; i < jsonData.length; i++) {
    let itr = 0
    let innerArr = Array()
    for (let x in jsonData[i]) {


      if (jsonData[i][x] !== null && Array.isArray(jsonData[i][x]) && typeof jsonData[i][x][0] === 'object') {
        let tempInnerArr = Array()
        let collectorArr = Array()
        for (let y in jsonData[i][x]) {
          tempInnerArr = []
          for (let z in jsonData[i][x][y]) {
            tempInnerArr.push(jsonData[i][x][y][z])
          }
          collectorArr.push(tempInnerArr)
        }
        innerArr.push(collectorArr)
      } else {
        innerArr.push(jsonData[i][x])
      }
    }
    outerArray.push(innerArr)
  }
  return outerArray
}
