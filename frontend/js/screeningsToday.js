// Loads today's screenings in the section to the right of the frontpage

// Gets list of screenings for a date
async function getScreeningsPerDate(dateString) {
  return await (await fetch('/api/VW_ScreeningDetailsByDate/' + dateString)).json();
}

// Fills the 'Current Screenings' container with screenings for each auditorium
async function drawTodayContainer(screeningsToday, headtitle) {
  let currentScreeningsContainer = document.querySelector('.current-screenings');
  let newDayContainer = document.createElement('div');
  newDayContainer.classList.add('current-screenings-day');
  currentScreeningsContainer.appendChild(newDayContainer);
  let currentDate = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" });

  let html = `<h2>${headtitle}</h2>`;

  if (screeningsToday.length === 0) {
    html += `
      <div class="current-screenings-auditorium">
      <p>No screenings this day</p>
    `;
  } else {
    // Sort screenings into Map depending on auditorium as key, arrays of screenings as value
    const auditoriums = new Map();
    let auditoriumArray = [];
    for (element of screeningsToday) {
      if (auditoriums.get(element.auditoriumId === undefined)) {
        auditoriumArray = [element];
        auditoriums.set(element.auditoriumId, auditoriumArray);
      } else {
        auditoriumArray = auditoriums.get(element.auditoriumId) || [];
        auditoriumArray.push(element);
        auditoriums.set(element.auditoriumId, auditoriumArray);
      }
    };

    // Loops map to create container for each auditorium and appends screening children
    for (const [key, value] of auditoriums.entries()) {
      html += `
    <div class="current-screenings-auditorium">
    <h3>${value[0].auditoriumName}</h3>
    `;

      value.forEach(element => {
        let alreadyStarted = (currentDate > element.date) ? true : false;
        html += `
      <p class="current-screenings-item${alreadyStarted ? ' current-screenings-item-started' : ''}" title="${element.movieTitle}">
        <a ${alreadyStarted ? 'onClick="launchToast(`This movie has already started!`)"' : ''} href="/tickets?screeningId=${element.id}">${element.date.substring(11)} - ${element.movieTitle}</a>
      </p>
      `;
      });
      html += '</div>';
    }
  }

  newDayContainer.innerHTML += html;
}

// Start method
async function loadTodayContainer() {
  let dateToday = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" });
  let dateTomorrow = new Date((new Date().getTime()) + 86400000).toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" });
  let dateTodayStr = dateToday.substring(0, 10);
  let dateTomorrowStr = dateTomorrow.substring(0, 10);

  console.log(dateToday)
  console.log(dateTomorrow)

  drawTodayContainer(await getScreeningsPerDate(dateTodayStr), 'Today');
  drawTodayContainer(await getScreeningsPerDate(dateTomorrowStr), 'Tomorrow');
}