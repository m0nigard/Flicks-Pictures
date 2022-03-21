// Global values
let selectedSeats = []; // Stores elements of selected seats (id found on selectedSeats[i].dataset.seatid)

let ticketTypes;  // Store ticket type information from db and counts of seats
let selectedTicketTypesCount = 0; // Store number of selected ticket types in modal
let selectedScreening;  // Contains the currently selected screening from the dropdown

let plusModalButtons;   // Plus button elements for ticket types in Modal
let minusModalButtons;  // Minus button elements for ticket types in Modal

// Get different ticket type prices
async function getTicketType() {
  return await (await fetch('/api/TicketType/')).json();
}

// Get screening details to fill dropdown menu
async function getScreeningDetailsPerDate(dateString) {
  return await (await fetch('/api/VW_ScreeningDetailsByDate/' + dateString)).json();
}

// Get screening details to fill dropdown menu
async function getScreeningDetails(id) {
  return await (await fetch('/api/VW_ScreeningDetails/' + id)).json();
}

// Sets up datepicker element
function setupDatePicker() {
  const datePicker = document.getElementById('ticket-datepicker');
  let currentDate = new Date();
  datePicker.value = currentDate.toJSON().substring(0, 10);
  datePicker.max = dateStringFormatter(currentDate.getFullYear() + '-' + (currentDate.getMonth() + 2) + '-' + currentDate.getDate());
  datePicker.min = dateStringFormatter(currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate());

  datePicker.addEventListener('change', event => {
    renderMovieSelect(datePicker.value)
  });
}

// Fills the dropdown menu with screenings of the picked date
async function renderMovieSelect(dateStr) {
  if (dateStr === '') { return; }
  const screenings = await getScreeningDetailsPerDate(dateStr);
  const movieSelect = document.getElementById('movie-ticket');
  let html = '';
  screenings.forEach(element => {
    html += `<option data-screening-id="${element.id}" value="${element.id}">${element.date.substring(11)} - ${element.auditoriumName} - ${element.movieTitle}</option>`;
  });
  movieSelect.innerHTML = html;

  // Load first screening
  if (screenings.length > 0) {
    renderSeatMap(screenings[0].id);
  }
}

// Draws the seat map canvas for seat selection
async function renderSeatMap(screeningId) {
  selectedScreening = await getScreeningDetails(screeningId);
  const allSeats = await JSON.parse(selectedScreening.allSeats);
  const seatMap = document.querySelector('.container-ticket');
  seatMap.setAttribute('data-screeningid', selectedScreening.id)
  let html = '<div class="screen"></div>';

  // Sort Seats into Map depending on row as key, arrays of seats as value
  const seats = new Map();
  let seatArray = [];
  for (element of allSeats) {
    if (seats.get(element.row === undefined)) {
      seatArray = [element];
      seats.set(element.row, seatArray);
    } else {
      seatArray = seats.get(element.row) || [];
      seatArray.push(element);
      seats.set(element.row, seatArray);
    }
  };

  // Prepare HTML for Cinema canvas
  for (const [key, value] of seats.entries()) {
    html += `<div class="row">`;

    value.forEach(element => {
      html += `<div class="seat" data-seatid="${element.seatId}"></div>`;
    });
    html += '</div>';
  }
  seatMap.innerHTML = html;
  updateSelectedCount();  // Re-count selected seats (to 0)
  refreshBookedSeats(screeningId);  // Mark any booked seats
}

// Refresh seat map to mark occupied seats
async function refreshBookedSeats() {
  const screeningDetails = await getScreeningDetails(document.querySelector('.container-ticket').getAttribute('data-screeningid'));
  const seatsTaken = await JSON.parse(screeningDetails.seatsTaken) || [];
  seatsTaken.forEach(element => {
    let seat = document.querySelector(`[data-seatid="${element.seatId}"]`)
    if (seat.classList.contains('selected')) {
      launchToast(`Seat ${element.number} on row ${element.row} was booked by someone else!`);
      seat.classList.remove('selected');
    }
    seat.classList.add('occupied');
  });
}

// Run this on confirm button press
async function setupTicketModal() {
  ticketTypes = await getTicketType();
  let ticketTypeHTML = '';

  ticketTypes.forEach((element, index) => {
    element.count = 0;
    ticketTypes[ticketTypes[index].name] = ticketTypes[index];  // Name array items to be able to get ticketTypes['nameOfType'] later
    ticketTypeHTML += `
      <div class="input-adult">
        <label class="input-ticket-type">${element.name}</label>
        <button type="button" id="${'sub' + element.id}" class="sub" data-ticket-type-name="${element.name}" data-ticket-type-id="${element.id}">-</button>
        <input type="text" id="${element.id}" value="0" readonly class="quantity-field" />
        <button type="button" id="${'add' + element.id}" class="add" data-ticket-type-name="${element.name}" data-ticket-type-id="${element.id}">+</button>
        <span class="ticket-type-price">${element.price}:-</span>
      </div>
    `;
  });
  document.querySelector('.modal-ticket-types').innerHTML = ticketTypeHTML;

  plusModalButtons = document.querySelectorAll('.add')
  minusModalButtons = document.querySelectorAll('.sub')
  setupModalButtonListeners(plusModalButtons, minusModalButtons);

  // För modal 
  const modal = document.getElementById("myModal");

  // When the user clicks on <span> (x), close the modal
  document.getElementsByClassName("close")[0].onclick = function () {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
  document.getElementById('confirm-booking').addEventListener('click', event => {
    if (selectedTicketTypesCount === selectedSeats.length) { createBooking(); }
  });
}

// Makes Add buttons unclickable when all ticket types for number of seats are selected
function makeButtonsNonClickable(value) {
  if (value <= 0) {
    plusModalButtons.forEach(element => {
      element.disabled = true;
    });
  } else {
    plusModalButtons.forEach(element => {
      element.disabled = false;
    });
  }
}

// update total and count
function updateSelectedCount() {
  selectedSeats = document.querySelectorAll('.row .seat.selected');

  // Disables Confirm button if no seat is selected - NOTE: SHOULD DISABLE ANIMATION ON DISABLE
  if (selectedSeats.length < 1) {
    document.getElementById("confirm").disabled = true;
  } else {
    document.getElementById("confirm").disabled = false;
  }

  let selectedSeatsCount = selectedSeats.length;
  document.getElementById('count').innerText = selectedSeatsCount;
  let ticketsLeftToPick = selectedSeatsCount - selectedTicketTypesCount;

  makeButtonsNonClickable(ticketsLeftToPick);
  calculateTotalPrice();
}

// Setup listeners for +/- buttons for ticket types in the Modal
function setupModalButtonListeners(plus, minus) {
  plus.forEach(element => {
    element.addEventListener('click', (event) => {
      // Increment count on Add button and store in TicketType object array
      selectedTicketTypesCount++;
      ticketTypes[element.dataset.ticketTypeName].count += 1;
      document.getElementById(element.dataset.ticketTypeId).value = ticketTypes[element.dataset.ticketTypeName].count;
      updateSelectedCount();
    });
  });
  minus.forEach(element => {
    element.addEventListener('click', (event) => {
      // Increment count on Add button and store in TicketType object array
      if (ticketTypes[element.dataset.ticketTypeName].count > 0) {
        ticketTypes[element.dataset.ticketTypeName].count -= 1;
        selectedTicketTypesCount--;
      }
      document.getElementById(element.dataset.ticketTypeId).value = ticketTypes[element.dataset.ticketTypeName].count;
      updateSelectedCount();
    });
  });
}

function calculateTotalPrice() {
  let totalPriceToPay = 0
  let totalAmountOfTickets = 0;
  ticketTypes.forEach(element => {
    let totPrice = element.count * element.price;
    document.getElementById(element.id).innerHTML = totPrice;
    totalPriceToPay += totPrice;
    totalAmountOfTickets += element.count;
  });
  renderTotalTickets(totalAmountOfTickets);
  renderTotalPrice(totalPriceToPay);
}

function renderTotalTickets(totalAmountOfTickets) {
  let ticketsLeft = selectedSeats.length - totalAmountOfTickets;
  document.getElementById('count2').innerText = selectedSeats.length; // "You have reserved X seats, select ticket type. "
  document.getElementById('ticket-type-left').innerText = ticketsLeft;  // "You have X more to choose"
}

function renderTotalPrice(totalPriceToPay) {
  document.getElementById('booking-info-totalprice').innerText = totalPriceToPay || 0;
}

// Make booking 
async function createBooking() {
  // Prepare data to divide selected TicketTypes to the SeatTickets
  let seatIdArr = []; let ticketTypeArr = [];
  selectedSeats.forEach(element => {
    seatIdArr.push(element.dataset.seatid);
  });
  ticketTypes.forEach(element => {
    for (let i = 0; i < element.count; i++) {
      ticketTypeArr.push(element.id);
    }
  });

  // Prepare body of POST 
  let requestBody = {};
  requestBody.seatTickets = [];
  requestBody.booking = {
    screeningId: selectedScreening.id
  };
  for (let i = 0; i < ticketTypeArr.length; i++) {
    requestBody.seatTickets[i] = { ticketTypeId: ticketTypeArr[i], seatId: seatIdArr[i] }
  }

  // Send REST POST
  let result = {};
  try {
    result = await (await fetch('/api/addBooking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })).json();
  } catch (error) {
    console.log(error);
  }
  
  renderConfirmation(requestBody, result);
  console.log('CreateBooking');
  console.log('-selectedSeats: ', selectedSeats);
  console.log('-TicketTypes: ', ticketTypes);
  console.log('-seatsArr: ', seatIdArr);
  console.log('-TicketTypesArr: ', ticketTypeArr);
  console.log('-screening: ', selectedScreening);
  console.log('-result: ', result);
}

// Booking confirmation, showing bookingId, MovieTitle, Date and which seats. 
async function renderConfirmation(requestBody, result) {
  if (!result._error) {
    let html = '';

    confirmedScreening = await getScreeningDetails(requestBody.booking.screeningId);
    const getProp = prop => obj => obj[prop];
    const getSeatId = getProp('seatId');
    const seats = requestBody.seatTickets.map(getSeatId);
   
    html += `<article>
    <p>Thank you for booking! <br><br> </p>
    Booking id: <span id="confirmation-bookingId">${result.newBooking.lastInsertRowid} <br> </span>
    Movie: <span id="confirmation-movie">${confirmedScreening.movieTitle} <br> </span>
    Date: <span id="confirmation-date">${confirmedScreening.date} <br> </span>  
    Ticket seats: <span id="confirmation-ticket">${seats}</span>
    </article>`

    document.getElementById('modal-book').innerHTML = html;
    
  } else {
    document.getElementById('modal-book').innerHTML = "Something went wrong with the booking, try again!";
  }

}

// Starter function for Tickets page
async function loadBookingPage() {
  setupTicketModal(); // Initialize ticket Modal (hidden before pressing 'BUY TICKETS')
  setupDatePicker();
  renderMovieSelect(new Date().toJSON().substring(0, 10));  // Fills dropdown menu with movies 

  // Setup dropdown menu for Movie selection
  const movieSelect = document.getElementById('movie-ticket');
  movieSelect.addEventListener('change', (e) => {
    renderSeatMap(e.target.value);
  });

  // Seat click event on seat map
  const container = document.querySelector('.container-ticket');
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
      e.target.classList.toggle('selected');
      updateSelectedCount();
    }
  });

  // When the user clicks on the button, open the modal
  document.getElementById("confirm").addEventListener('click', async event => {
    // If user not logged in, show login prompt instead (requires userLogin.js)
    if (await getLoggedOnUser() === null) {
      renderLoginWindow();
      return;
    }
    document.getElementById("myModal").style.display = "block";  // Show Modal
    document.getElementById('booking-info-date').innerHTML = selectedScreening.date;
    document.getElementById('booking-info-movie').innerHTML = selectedScreening.movieTitle;
    document.getElementById('booking-info-auditorium').innerHTML = selectedScreening.auditoriumName;
  });
}