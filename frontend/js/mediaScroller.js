let movieScrollerArray = [];


async function getDataToMovieScroller(){
    return await(await fetch('/api/VW_MoviesWithActiveScreenings')).json();
}



async function startMediaScroller(){
    console.log("Kommer jag hit? - 1")
    movieScrollerArray =  await getDataToMovieScroller();

    console.log("Kommer jag hit?")

    let html = ''
    for(let movie of movieScrollerArray){
        html += 
        `
        <div class="item">
            <a class="movieScrollerAtag" href="/movie-details?id=${movie.id}">
                <img class="picMS" src="image/images-movies/${movie.imagePath}" alt="${movie.title}">
                <p class="titleMS">${movie.title}</p>
            </a>
        </div>
        `
    }

    document.querySelector('.movie-scroller').innerHTML = html

}