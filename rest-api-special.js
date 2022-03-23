// Non-generic customized REST routes


// runQuery(response, params, sqlAsText, noArray = false)
module.exports = function (app, runQueryFunction, db) {
  // require funktion
  const nodemailer = require("nodemailer");
  const emailFunction = require('./email');

  app.get('/api/VW_ScreeningDetailsByDate/:date', (req, res) => {

    // Return Screening details filtered by date
    // Format: YYYY-MM-DD  - Can be shortened for wider filter, such as 2022-03 for one month
    runQueryFunction(res, req.params, `
      SELECT * FROM VW_ScreeningDetails
      WHERE substr(date, 0, 12) LIKE :date || '%'
      `);
  });

  app.delete('/api/myBooking/:bookingId', (req, res) => {

    let userId = req.session.user?.id;  // Get logged in user

    const cancelBooking = db.prepare(`
      UPDATE Booking
      SET cancelled = 1
      WHERE id = @bookingId
      AND
      customerId = ${userId}
  `);

    const cancelTickets = db.prepare(`
      UPDATE SeatTicket
      SET screeningId = NULL
      WHERE bookingId = @bookingId 
      AND 
      (SELECT customerId from Booking WHERE customerId = ${userId}
      And
      id = @bookingId)
  `);

    let transactionResult = { cancelBooking: null, cancelTickets: null }

    const transaction = db.transaction(() => {
      transactionResult.cancelBooking = cancelBooking.run({ ...{ userId: userId }, ...req.params });
      transactionResult.cancelTickets = cancelTickets.run({ ...{ userId: userId }, ...req.params });
    });

    let errorResult;  // Stores error message on error
    try {
      transaction();  // Commits transaction. SeatTickets 2+ as argument
    } catch (error) {
      errorResult = { _error: error + '' }
    }

    // Return result
    if (errorResult !== undefined) {
      console.log(errorResult)
      res.status(500);
      res.json(errorResult)
    } else {
      if (!transactionResult) {
        console.log(errorResult)
        res.status(404);
      }
      res.json(transactionResult);
    }
  });

  app.get('/api/myBooking/', (req, res) => {

    let userId = req.session.user?.id;  // Get logged in user

    runQueryFunction(res, { customerId: userId }, `
    SELECT * FROM VW_BookingList
    WHERE customerId = :customerId
    `);

  });

  // Route to add booking (not using the default runQueryFunction)
  app.post('/api/addBooking', (req, res) => {
    let userId = req.session.user?.id;  // Get logged in user
    let date = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" });

    // Add date and userId to booking
    req.body.booking.customerId = userId;
    req.body.booking.date = date.substring(0, 16);

    // Prepare data
    let seatTickets = req.body.seatTickets;
    let seatTicketsTwo = [];
    if (seatTickets.length > 1) {
      for (let i = 1; i < seatTickets.length; i++) {
        seatTicketsTwo.push({ ...{ screeningId: req.body.booking.screeningId }, ...seatTickets[i] })
      }
    }

    // Statement for the Booking table
    const newBooking = db.prepare(`
      INSERT INTO Booking(date, customerId, screeningId)
      VALUES(@date, @customerId, @screeningId)
    `);

    // Statement for the first SeatTicket, referencing the bookingId.id with last_insert_rowid()
    let firstSeatTicket = db.prepare(`
      INSERT INTO SeatTicket (bookingId, ticketTypeId, seatId, screeningId)
      VALUES(last_insert_rowid(), @ticketTypeId, @seatId, @screeningId)
    `);

    // Statement for all following SeatTickets, referencing the bookingId of the last SeatTicket with last_insert_rowid()
    let ticketInsert = db.prepare(`
        INSERT INTO SeatTicket (bookingId, ticketTypeId, seatId, screeningId)
        SELECT bookingId, @ticketTypeId, @seatId, @screeningId
        FROM SeatTicket where id = last_insert_rowid()
    `);

    // Prepare Transaction
    // Transcation will only create the Booking and all SeatTickets if ALL of them can be created. 
    // If not, an error will be sent back to the REST client and nothing will be saved in the database
    let bookingResult = { newBooking: null, newSeatTickets: [] };   // Stores db results
    const transaction = db.transaction((ticketInsertList) => {
      bookingResult.newBooking = newBooking.run(req.body.booking);
      bookingResult.newSeatTickets.push(firstSeatTicket.run({ ...{ screeningId: req.body.booking.screeningId }, ...seatTickets[0] }));
      for (const seatTicket of ticketInsertList) {
        bookingResult.newSeatTickets.push(ticketInsert.run(seatTicket));
      }
    });

    let errorResult;  // Stores error message on error
    try {
      transaction(seatTicketsTwo);  // Commits transaction. SeatTickets 2+ as argument
    } catch (error) {
      errorResult = { _error: error + '' }
    }

    // Return result
    if (errorResult !== undefined) {
      console.log(errorResult)
      res.status(500);
      res.json(errorResult)
    } else {
      if (!bookingResult) {
        console.log(errorResult)
        res.status(404);
      }
      emailFunction(req.session.user.email, nodemailer, req.body);
      res.json(bookingResult);
    }
  });
}