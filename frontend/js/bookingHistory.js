//initialize html variables
let bookingHistoryHtml
let BookingHistoryPopUp

// load page
async function loadBookingHistoryPage() {

    // get important info
    let myBookingsHistory = await (await fetch('/api/myBooking/')).json();

    // load the html table
    createTable(myBookingsHistory)

    // put the html in
    document.querySelector(".myBookings").innerHTML = bookingHistoryHtml

    // if an element in table is clicked get more information
    document.querySelector("tbody").addEventListener("click", function (event) {

        // get the info
        let info = myBookingsHistory[event.target.closest("tr").dataset.bookinghistoryIndex]
        let modal = document.getElementById('moreInfoBooking')

        // show the div
        modal.style.display = "block"

        // add the html 
        var today = new Date()
        var movieDate = new Date(info.movieStartTime)
        renderPopUpBooking(info, today, movieDate)

        // show the html
        document.querySelector(".modal-content").innerHTML = BookingHistoryPopUp

        //close pop up
        document.querySelector(".close").addEventListener("click", function (event) {

            modal.style.display = "none"
        })

        // Movie details. Show details for the movie.
        document.querySelector("#movie-details").addEventListener("click", function (event) {

            renderMovieDetails(info)

            // show the html
            document.querySelector(".modal-content").innerHTML = BookingHistoryPopUp

            document.querySelector(".close").addEventListener("click", function (event) {

                modal.style.display = "none"
            })
            // back button
            document.querySelector("#back-button").addEventListener("click", async function (event) {
                modal.style.display = "none"

            })
        })

        // Huge if statment that add cancel booking button selector if you should be able to.
        if (info.cancelled === 0 && today < movieDate) {

            // cancel booking
            document.querySelector("#cancel-booking").addEventListener("click", async function (event) {

                // html buttons to confirm
                renderConfirmButtons(info)

                // display
                document.querySelector(".modal-content").innerHTML = BookingHistoryPopUp

                // close the popup if cross is pressed
                document.querySelector(".close").addEventListener("click", function (event) {

                    modal.style.display = "none"
                })

                // if yes is pressed cancell booking
                document.querySelector("#yes-button").addEventListener("click", async function (event) {

                    let result = {}

                    // try catch to call rest delete method.
                    try {
                        result = await (await fetch(`/api/myBooking/${info.id}`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                        })).json();
                    } catch (error) {
                        console.log(error);
                    }

                    // toast to confirm
                    launchToast("Cancellation confirmed")

                    // hide and reload html
                    modal.style.display = "none"
                    loadBookingHistoryPage()

                })
                // if no just go back to booking history
                document.querySelector("#no-button").addEventListener("click", async function (event) {
                    modal.style.display = "none"

                })

            })
        }
    })
}

//create the table
function createTable(myBookingsHistory) {
    bookingHistoryHtml = `<table class = "historyTable">
    <thead>
        <tr>
            <h1>Booking History</h1>
            <th>Title</th>
            <th>Start-Time</th>
            <th>Tickets</th>
            <th>Nix --</th>
        </tr>
     </thead>
     <tbody>`

    // put the information into the table
    for (let i = 0; i < myBookingsHistory.length; i++) {

        bookingHistoryHtml += `
        <tr data-bookingId = "${myBookingsHistory[i].id}" data-bookinghistory-index=${i}>
        <td>${myBookingsHistory[i].title}</td>
        <td>${myBookingsHistory[i].movieStartTime}</td>
        <td>${myBookingsHistory[i].seatTypes}</td>`
        if (myBookingsHistory[i].cancelled == 0) {
            bookingHistoryHtml += `<td>&#9989;</td>`
        } else {
            bookingHistoryHtml += `<td>&#10060</td>`
        }
        bookingHistoryHtml += `</tr>`
    }

    bookingHistoryHtml += `</tbody> 
    </table>`
}

// render pop up html
function renderPopUpBooking(info, today, movieDate) {
    BookingHistoryPopUp = `
        <span class="close" id = close-bookingInfo>&times;</span>
        <a href="/movie-details?id=${info.movieId}" id = "booking-image" class="movie-link"><img class ="movie-picture" src="./image/images-movies/${info.movieImage}"></a>   
        <div class ="head-popup">
            <h1 class = movie-title>${info.title}</h1>
        </div>
        <div class ="body-popup">
            <p class = info-text> Saloon: ${info.saloon} </p>
            <p class = info-text> Seats: ${info.seatNumbers} </p>
            <p class = info-text> Start: ${info.movieStartTime}</p>
            <p class = info-text> Booking date: ${info.date} </p>
        </div>
        <div class ="footer-popup">
            <button class="button-book" id="movie-details">
            <span></span> Movie Info
            </button>`

    // get dates to make sure you should be able to cancel a booking.
    if (info.cancelled === 0 && today < movieDate) {
        BookingHistoryPopUp += `
            <button class="button-book" id="cancel-booking">
                <span></span> Cancel Booking
            </button>`

    }
    BookingHistoryPopUp += `</div>`
}

// render Movie Details
function renderMovieDetails(info) {
    BookingHistoryPopUp = `
        <span class="close" id = close-bookingInfo>&times;</span>
        <a href="/movie-details?id=${info.movieId}" id = "booking-image" class="movie-link"><img class ="movie-picture" src="./image/images-movies/${info.movieImage}"></a>
        <div class ="head-popup">
            <h1 class = movie-title>${info.title}</h1>
        </div>
        <div class ="body-popup">
            <p class = info-text> Length MIN: ${info.minuteLength} </p>
            <p class = info-text> Languages: ${info.language}</p>
            <p class = info-text> Subtitles: ${info.languageSubtitle}</p>
            <p class = info-text> Age: ${info.ageGroup}</p>
        </div>
        <div class ="footer-popup">
            <button class="button-book" id="back-button">
            <span></span> exit
            </button>`

    BookingHistoryPopUp += `</div>`
}

// render confirm buttons
function renderConfirmButtons(info) {
    BookingHistoryPopUp =
        `<span class="close" id = close-cancelConfirmation>&times;</span>
        <h1>Are you sure you want to cancel</h1>
        <div class = footer-popup>
            <button class="button-book" id="yes-button">
                <span></span> Yes
            </button>
            <button class="button-book" id="no-button">
                <span></span> NO
            </button>
        </div>`

}
