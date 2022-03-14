// Loads today's screenings in the section to the right
// WORK IN PROGRESS

async function getTodaysScreenings() {
  return await (await fetch('/api/VW_ScreeningsToday')).json();
}

async function loadTodayContainer() {
  let screeningsToday = await getTodaysScreenings();
  let todayContainer = document.querySelector('.screenings-today');
  let html = '<h2>Today</h2>';

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

  console.log(screeningsToday);
  console.log(auditoriums.keys());
}