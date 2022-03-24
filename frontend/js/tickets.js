// This js file includes data fetching, seatmap and tickets driver code
// Requirement: Must run together with ticketsModal.js 

// Global values
let selectedSeats = []; // Stores elements of selected seats (id found on selectedSeats[i].dataset.seatid)

let ticketTypes;  // Store ticket type information from db and counts of seats
let selectedTicketTypesCount = 0; // Store number of selected ticket types in modal
let selectedScreening;  // Contains the currently selected screening from the dropdown

let ticketRefreshInterval;  // Filled by setInterval in loadBookingPage and cleared on booking confirmation

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
function setupDatePicker(date) {
  const datePicker = document.getElementById('ticket-datepicker');
  let currentDate = new Date();
  datePicker.value = date;
  datePicker.max = dateStringFormatter(currentDate.getFullYear() + '-' + (currentDate.getMonth() + 2) + '-' + currentDate.getDate());
  datePicker.min = dateStringFormatter(currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate());

  datePicker.addEventListener('change', event => {
    renderMovieSelect(datePicker.value, null)
  });
}

// Fills the dropdown menu with screenings of the picked date
async function renderMovieSelect(dateStr, paramId) {
  if (dateStr === '') { return; }
  const screenings = await getScreeningDetailsPerDate(dateStr);
  const movieSelect = document.getElementById('movie-ticket');
  let html = '';
  screenings.forEach(element => {
    html += `<option ${element.id === paramId ? 'selected' : ''} data-screening-id="${element.id}" value="${element.id}">${element.date.substring(11)} - ${element.auditoriumName} - ${element.movieTitle}</option>`;
  });
  movieSelect.innerHTML = html;

  // If screening from params, load screening
  if (paramId !== null) {
    renderSeatMap(paramId);
    return;
  }

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
      html += `<div class="seat" data-seatid="${element.seatId}" data-row="${element.row}" data-number="${element.number}" title="R${element.row}-S${element.number}"></div>`;
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
    updateSelectedCount();
  });
}

// update total and count
function updateSelectedCount() {
  selectedSeats = document.querySelectorAll('.row .seat.selected');

  let selectedSeatsCount = selectedSeats.length;
  document.getElementById('count').innerText = selectedSeatsCount;
  let ticketsLeftToPick = selectedSeatsCount - selectedTicketTypesCount;

  makeButtonsNonClickable(ticketsLeftToPick);
  calculateTotalPrice();
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
  requestBody.booking.movieTitle = selectedScreening.movieTitle;

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
  renderConfirmation(result);
}

// Starter function for Tickets page
async function loadBookingPage(params) {
  // Manage params to allow datepicker and selected screening to be adjusted
  let paramId = null;
  if (params !== undefined) {
    paramId = parseInt(params.get('screeningId')) || null;
  }
  let date = new Date().toJSON().substring(0, 10);
  if (paramId !== null) {
    let paramScreening = await getScreeningDetails(paramId);
    date = paramScreening.date.substring(0, 10);
  }

  setupTicketModal(); // Initialize ticket Modal (hidden before pressing 'BUY TICKETS')
  setupDatePicker(date);
  renderMovieSelect(date, paramId);  // Fills dropdown menu with movies 

  // Setup dropdown menu for Movie selection
  const movieSelect = document.getElementById('movie-ticket');
  movieSelect.addEventListener('change', (e) => {
    renderSeatMap(e.target.value);
  });

  // Seat click event on seat map
  const container = document.querySelector('.container-ticket');
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
      // If movie has already started, don't select seat and instead throw a toast
      if (selectedScreening.date < (new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" }))) {
        launchToast('This movie has already started!');
        return;
      }
      e.target.classList.toggle('selected');
      updateSelectedCount();
    }
  });

  // When the user clicks on the button, open the modal
  document.getElementById("confirm").addEventListener('click', async event => {
    // If user not logged in, show login prompt instead (requires userLogin.js)
    if (await getLoggedOnUser() === null) {
      launchToast('Please Login to continue');
      renderLoginWindow();
      return;
    }
    if (selectedSeats.length < 1) {
      launchToast('Please select a seat before you continue');
      return;
    }
    document.getElementById("myModal").style.display = "block";  // Show Modal
    document.getElementById('booking-info-date').innerHTML = selectedScreening.date;
    document.getElementById('booking-info-movie').innerHTML = selectedScreening.movieTitle;
    document.getElementById('booking-info-auditorium').innerHTML = selectedScreening.auditoriumName;
  });

  // Clear interval for seatmap refreshing
  if (ticketRefreshInterval !== undefined) { clearInterval(ticketRefreshInterval); }

  // Refresh seatmap every 10 sec
  ticketRefreshInterval = setInterval(() => {
    if (document.querySelector('.container-ticket') === null) {
      clearInterval(ticketRefreshInterval);   // Clear interval when navigated to another page
      return;
    };
    refreshBookedSeats();
  }, 10000);  // Refresh interval in ms
}