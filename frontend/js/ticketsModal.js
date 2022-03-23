// This js file sets up the modals on the ticket page
// Requirement: Must run together with tickets.js 

let plusModalButtons;   // Plus button elements for ticket types in Modal
let minusModalButtons;  // Minus button elements for ticket types in Modal

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
      if (document.getElementById('myModal').classList.contains('confirmation-success')) {
        location.href = '/bookings';  // After confirmation, go to My Bookings
        return;
      } else if (document.getElementById('myModal').classList.contains('confirmation-error')) {
        location.href = '/tickets';   // On booking failure, reload tickets page
      }
      modal.style.display = "none";
    }
  }
  document.getElementById('confirm-booking').addEventListener('click', event => {
    if (selectedTicketTypesCount === selectedSeats.length) {
      createBooking();
    } else {
      launchToast(`You need to select ${selectedSeats.length - selectedTicketTypesCount} more tickets!`);
    }
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

// Booking confirmation, showing bookingId, MovieTitle, Date and which seats. 
async function renderConfirmation(result) {
  clearInterval(ticketRefreshInterval);
  if (!result._error) {
    document.getElementById('myModal').classList.add('confirmation-success');
    let html = '', seatsString = '';
    selectedSeats.forEach((element, index) => {
      seatsString += `R${element.dataset.row}-S${element.dataset.number}`;
      if (index !== selectedSeats.length - 1) { seatsString += ', ' };
    });

    html += `<article>
    <p>Thank you for booking! <br><br> </p>
    Booking id: <span id="confirmation-bookingId">${result.newBooking.lastInsertRowid} <br> </span>
    Movie: <span id="confirmation-movie">${selectedScreening.movieTitle} <br> </span>
    Date: <span id="confirmation-date">${selectedScreening.date} <br> </span>  
    Ticket seats: <span id="confirmation-ticket">${seatsString}</span>
    <p><br>Navigating to My Bookings in <span class="confirmation-countdown">10</span> seconds... </p>
    </article>`

    document.getElementById('modal-book').innerHTML = html;
    setTimeout(() => {
      location.href = '/bookings';
    }, 10000);
    setInterval(() => {
      let countdown = document.querySelector('.confirmation-countdown');
      let num = parseInt(countdown.innerHTML);
      countdown.innerHTML = num > 0 ? num - 1 : 0;
    }, 1000)
  } else {
    document.getElementById('myModal').classList.add('confirmation-error');
    document.getElementById('modal-book').innerHTML = "Something went wrong with the booking, try again!";
  }
}