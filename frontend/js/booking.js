
function loadBookingPage(){



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
const movieSelect = document.getElementById('movie-ticket');


populateUI();
//let ticketPrice = +movieSelect.value;

// Save selected movie index and price
function setMovieData(movieIndex, moviePrice) {
  localStorage.setItem('selectedMovieIndex', movieIndex);
  localStorage.setItem('selectedMoviePrice', moviePrice);
}

// update total and count
function updateSelectedCount() {
  calculateTotalPrice();
  const selectedSeats = document.querySelectorAll('.row .seat.selected');
  check = selectedSeats.length;

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


function makeButtonsNonClickable(value){
  if(value <= 0){
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

function calculateTotalPrice(){
  amountAdult = document.querySelectorAll('.quantity-field')[0].value;
  amountRetired = document.querySelectorAll('.quantity-field')[1].value;
  amountChild = document.querySelectorAll('.quantity-field')[2].value;
 
  totpriceAdult = amountAdult * ticketAdult;
  totpriceRetired = amountRetired * ticketRetired;
  totpriceChild = amountChild * ticketChildren;

  totalAmountOfTickets = parseInt(amountAdult) + parseInt(amountRetired) + parseInt(amountChild);
  
  totalPriceToPay = totpriceAdult + totpriceRetired + totpriceChild;

}

// get data from localstorage and populate ui
function populateUI() {
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

// Movie select event

console.log(movieSelect);

movieSelect.addEventListener('change', (e) => {
 // ticketPrice = +e.target.value;
  setMovieData(e.target.selectedIndex, e.target.value);
  updateSelectedCount();
});



// Seat click event
container.addEventListener('click', (e) => {
  if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
    e.target.classList.toggle('selected');
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


plus[0].addEventListener("click", function(){
  countNumAdult += 1;  
  document.getElementById("1").value = countNumAdult;
  updateSelectedCount();
});

plus[1].addEventListener("click", function(){
  countNumRetired += 1;
  document.getElementById("2").value = countNumRetired; 
  updateSelectedCount();

});

plus[2].addEventListener("click", function(){
  countNumChild += 1;
  document.getElementById("3").value = countNumChild; 
  updateSelectedCount();

});

minus[0].addEventListener("click", function(){
  countNumAdult -= 1;  
  countNumAdult = countNumAdult < 0 ? 0 : countNumAdult;
  document.getElementById("1").value = countNumAdult; 
  updateSelectedCount();
});

minus[1].addEventListener("click", function(){
  countNumRetired -= 1;
  countNumRetired = countNumRetired < 0 ? 0 : countNumRetired;
  document.getElementById("2").value = countNumRetired; 
  updateSelectedCount();

});

minus[2].addEventListener("click", function(){
  countNumChild -= 1;
  countNumChild = countNumChild < 0 ? 0 : countNumChild;
  document.getElementById("3").value = countNumChild; 
  updateSelectedCount();
});


// Make booking 
function createBooking(){
  
}



// För modal 
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("confirm");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

}
