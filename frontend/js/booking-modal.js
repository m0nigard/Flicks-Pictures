// Booking-modal which is used on the movie-details page when pressing "Book tickets"


// Setting up and building the HTML of the modal
async function setupBookingModal(processedData, id) {
  html = ''
  html += `
  <span class="close">&times;</span>
  <table class="movie-desc-table">
  <thead>
  <tr>
  <th>Date</th>
  <th>Auditorium</th>
  <th>Free seats</th>
  <th>Book</th>
</tr>
</thead>
<tbody>
  `
  processedData.forEach(element => {
    html += `
    <td>${element.date}</td>
    <td>${element.auditoriumName}</td>
    <td>${element.numberOfAvailableSeats} 
    / ${element.numberOfTotalSeats}</td>

    <td><a href="/tickets?screeningId=${element.screeningId}">&#9989;</a></td>
    </tr>
    
    `
  });

  html += '</tbody></table>'

  // Setting the html to the modal-content div
  document.querySelector('.modal-content').innerHTML = html;

  const modal = document.getElementById("myModal");

  // Checking if user presses X (closing the modal)
  document.getElementsByClassName("close")[0].onclick = function () {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it also
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}
