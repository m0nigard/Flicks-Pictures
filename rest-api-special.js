// Non-generic customized REST routes


// runQuery(response, params, sqlAsText, noArray = false)
module.exports = function (app, runQueryFunction, db) {
  app.get('/api/VW_ScreeningDetailsByDate/:date', (req, res) => {

    // Return Screening details filtered by date
    // Format: YYYY-MM-DD  - Can be shortened for wider filter, such as 2022-03 for one month
    runQueryFunction(res, req.params, `
      SELECT * FROM VW_ScreeningDetails
      WHERE substr(date, 0, 12) LIKE :date || '%'
      `);
  });
}