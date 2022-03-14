// Loads today's screenings in the section to the right of the frontpage

async function getTodaysScreenings() {
  return await (await fetch('/api/VW_ScreeningsToday')).json();
}

// Fills the 'Today' container with screenings for each auditorium
async function drawTodayContainer(screeningsToday) {
  let todayContainer = document.querySelector('.screenings-today');
  let html = '<h2>Today</h2>';

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
    <div class="screenings-today-auditorium">
    <h3>${value[0].auditoriumName}</h3>
    `;

    value.forEach(element => {
      html += `
      <p class="screenings-today-item" title="${element.movieTitle}">
        <a href="/tickets?screeningId=${element.id}">${element.date.substring(11)} - ${element.movieTitle}</a>
      </p>
      `;
    });
    html += '</div>';
  }
  todayContainer.innerHTML = html;
}

// Start method
async function loadTodayContainer() {
  let screeningsToday = await getTodaysScreenings();
  drawTodayContainer(screeningsToday);
}