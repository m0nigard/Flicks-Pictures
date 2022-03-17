// Global values
let selectedSeats = [];

// Get different ticket type prices
async function getTicketType() {
  return await (await fetch('/api/TicketType/')).json();
}

// Get screening details to fill dropdown menu
async function getScreeningsPerDate(dateString) {
  return await (await fetch('/api/VW_ScreeningDetailsByDate/' + dateString)).json();
}

// Get screening details to fill dropdown menu
async function getScreeningDetails(id) {
  return await (await fetch('/api/VW_ScreeningDetails/' + id)).json();
}

// Fills the dropdown menu with screenings of the picked date
async function renderMovieSelect(dateStr) {
  const screenings = await getScreeningsPerDate(dateStr);
  const movieSelect = document.getElementById('movie-ticket');
  let html = '';
  screenings.forEach(element => {
    html += `<option data-screening-id="${element.id}" value="${element.id}">${element.date.substring(11)} - ${element.auditoriumName} - ${element.movieTitle}</option>`;
  });
  movieSelect.innerHTML = html;
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

async function renderSeatMap(screeningId) {
  const screeningDetails = await getScreeningDetails(screeningId);
  const allSeats = await JSON.parse(screeningDetails.allSeats);
  const seatMap = document.querySelector('.container-ticket');
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

  refreshBookedSeats(screeningId);
  //populateUI();
}

// Refresh seat map to mark occupied seats
async function refreshBookedSeats(screeningId) {
  console.log('inside refresh');
  const screeningDetails = await getScreeningDetails(screeningId);
  const seatsTaken = await JSON.parse(screeningDetails.seatsTaken) || [];

  seatsTaken.forEach(element => {
    document.querySelector(`[data-seatid="${element.seatId}"]`).classList.add('occupied');
  });
}




async function loadBookingPage() {
  const movieSelect = document.getElementById('movie-ticket');
  movieSelect.addEventListener('change', (e) => {
    // ticketPrice = +e.target.value;

    renderSeatMap(e.target.value);
    //setMovieData(e.target.selectedIndex, e.target.value);
    //updateSelectedCount();
  });

  setupDatePicker();

  let dateTodayStr = new Date().toJSON().substring(0, 10);
  renderMovieSelect(dateTodayStr);

  const ticketTypes = await getTicketType()

  // When the user clicks on the button, open the modal
  document.getElementById("confirm").addEventListener('click', async event => {
    // If user not logged in, show login prompt instead (requires userLogin.js)
    if (await getLoggedOnUser() === null) {
      renderLoginWindow();
      return;
    }
    modal.style.display = "block";  // Show Modal
  });


  ticketChildren = 65;
  ticketAdult = 85;
  ticketRetired = 75;
  var totalAmountOfTickets = 0;
  var ticketsLeftToPick = 0;


  let plus = document.querySelectorAll('.add')
  let minus = document.querySelectorAll('.sub')
  const container = document.querySelector('.container-ticket');
  const seats = document.querySelectorAll('.row .seat:not(.occupied');
  const count = document.getElementById('count');
  const count2 = document.getElementById('count2');
  const count3 = document.getElementById('ticket-type-left');
  const total = document.getElementById('booking-info-totalprice');



  //populateUI();
  //let ticketPrice = +movieSelect.value;

  // Save selected movie index and price
  function setMovieData(movieIndex, moviePrice) {
    localStorage.setItem('selectedMovieIndex', movieIndex);
    localStorage.setItem('selectedMoviePrice', moviePrice);
  }

  // update total and count
  function updateSelectedCount() {
    calculateTotalPrice();
    selectedSeats = document.querySelectorAll('.row .seat.selected');

    // Disables Confirm button if no seat is selected - NOTE: SHOULD DISABLE ANIMATION ON DISABLE
    if (selectedSeats.length < 1) {
      document.getElementById("confirm").disabled = true;
    } else {
      document.getElementById("confirm").disabled = false;
    }

    const seatsIndex = [...selectedSeats].map((seat) => [...seats].indexOf(seat));

    localStorage.setItem('selectedSeats', JSON.stringify(seatsIndex));

    //copy selected seats into arr
    // map through array
    //return new array of indexes

    const selectedSeatsCount = selectedSeats.length;

    selectedSeatsCountCopy = selectedSeatsCount;

    count.innerText = selectedSeatsCount;
    count2.innerText = selectedSeatsCount;

    ticketsLeftToPick = selectedSeatsCountCopy -= totalAmountOfTickets;
    makeButtonsNonClickable(ticketsLeftToPick);
    count3.innerText = ticketsLeftToPick;
    total.innerText = totalPriceToPay;

  }


  function makeButtonsNonClickable(value) {
    if (value <= 0) {
      plus[0].disabled = true;
      plus[1].disabled = true;
      plus[2].disabled = true;
    } else {
      plus[0].disabled = false;
      plus[1].disabled = false;
      plus[2].disabled = false;
    }
  }


  // get values from ticket plus and minus

  function calculateTotalPrice() {
    amountAdult = document.querySelectorAll('.quantity-field')[0].value;
    amountRetired = document.querySelectorAll('.quantity-field')[1].value;
    amountChild = document.querySelectorAll('.quantity-field')[2].value;

    totpriceAdult = amountAdult * ticketAdult;
    totpriceRetired = amountRetired * ticketRetired;
    totpriceChild = amountChild * ticketChildren;

    totalAmountOfTickets = parseInt(amountAdult) + parseInt(amountRetired) + parseInt(amountChild);

    totalPriceToPay = totpriceAdult + totpriceRetired + totpriceChild;

  }

  // populateUI was here



  // Movie select event

  console.log(movieSelect);






  // Seat click event
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
      e.target.classList.toggle('selected');
      console.log(e.target.dataset.seatid);
      updateSelectedCount();
    }
  });


  // intial count and total
  updateSelectedCount();

  // + and - for tickets
  countNumAdult = 0;
  countNumRetired = 0;
  countNumChild = 0;

  let quantity = document.querySelectorAll("quantity-field");


  plus[0].addEventListener("click", function () {
    countNumAdult += 1;
    document.getElementById("1").value = countNumAdult;
    updateSelectedCount();
  });

  plus[1].addEventListener("click", function () {
    countNumRetired += 1;
    document.getElementById("2").value = countNumRetired;
    updateSelectedCount();

  });

  plus[2].addEventListener("click", function () {
    countNumChild += 1;
    document.getElementById("3").value = countNumChild;
    updateSelectedCount();

  });

  minus[0].addEventListener("click", function () {
    countNumAdult -= 1;
    countNumAdult = countNumAdult < 0 ? 0 : countNumAdult;
    document.getElementById("1").value = countNumAdult;
    updateSelectedCount();
  });

  minus[1].addEventListener("click", function () {
    countNumRetired -= 1;
    countNumRetired = countNumRetired < 0 ? 0 : countNumRetired;
    document.getElementById("2").value = countNumRetired;
    updateSelectedCount();

  });

  minus[2].addEventListener("click", function () {
    countNumChild -= 1;
    countNumChild = countNumChild < 0 ? 0 : countNumChild;
    document.getElementById("3").value = countNumChild;
    updateSelectedCount();
  });


  // Make booking 
  function createBooking() {

  }



  // För modal 
  var modal = document.getElementById("myModal");



  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];



  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

}

// get data from localstorage and populate ui
function populateUI() {
  const movieSelect = document.getElementById('movie-ticket');
  const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats'));
  if (selectedSeats !== null && selectedSeats.length > 0) {
    seats.forEach((seat, index) => {
      if (selectedSeats.indexOf(index) > -1) {
        seat.classList.add('selected');
      }
    });
  }

  const selectedMovieIndex = localStorage.getItem('selectedMovieIndex');

  if (selectedMovieIndex !== null) {
    movieSelect.selectedIndex = selectedMovieIndex;
  }
}