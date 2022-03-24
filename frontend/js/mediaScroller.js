let movieScrollerArray = [];


async function getDataToMovieScroller(){
    return await(await fetch('/api/VW_MoviesWithActiveScreenings')).json();
}



async function startMediaScroller(){
    movieScrollerArray =  await getDataToMovieScroller();

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

    document.querySelector('.ms-content').innerHTML = html

}

document.querySelector(".ms-leftarrow").addEventListener('click', () => {
    let counter = 0;
    const leftInterval = setInterval(() => {
        if(counter === 200){
            clearInterval(leftInterval)
        }
        document.querySelector(".ms-content").scrollLeft -= 1;
        counter++;
    }, 1); 
    
    
});

document.querySelector(".ms-rightarrow").addEventListener('click', () => {
    let counter = 0;
    const rightInterval = setInterval(() => {
        if(counter === 200){
            clearInterval(rightInterval)
        }
        document.querySelector(".ms-content").scrollLeft += 1.5;
        counter++;
    }, 1); 
});