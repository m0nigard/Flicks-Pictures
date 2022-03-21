// Function for sending email confirmation of booking.
module.exports = function emailConfig(email, nodemailer, confirmationInfo) {

  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport({
    // Should be in seperate private file. 
    service: 'gmail',
    auth: {
      user: 'flickspictures1@gmail.com',
      pass: 'flickspictures123'
    }
  });

  const getProp = prop => obj => obj[prop];
  const getSeatId = getProp('seatId');
  const seats = confirmationInfo.seatTickets.map(getSeatId);

  htmlbody = '';
  htmlbody += `<p>Thank you for booking! <br> </p>
    Movie: <span id="confirmation-movie">${confirmationInfo.booking.movieTitle} <br> </span>
    Date: <span id="confirmation-date">${confirmationInfo.booking.date} <br> </span>  
    Ticket seats: <span id="confirmation-ticket">${seats}<br></span>
    <p>Best regards, Flicks Pictures.<br></p>
    <p>Hkr Street 1, 666 66 Kristianstad</p>
    </article>`

  var mailOptions = {
    from: 'flickspictures1@gmail.com',
    to: email,
    subject: 'Booking confirmation',
    html: htmlbody
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

}

//emailConfig.catch(console.error);
