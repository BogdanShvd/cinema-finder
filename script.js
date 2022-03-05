const searchingName = document.getElementById(`movie-name`);
const searchingType = document.getElementById(`movie-type`);
const searchBtn = document.getElementById(`search-btn`);
const searchStatus = document.getElementById(`search-status`);
const resultContainer = document.getElementById(`search-results-container`);
const apiKey = "fe7b9961";
const regexp = /^[a-zA-Z0-9][a-zA-Z0-9 :\-,.!?&]*$/;

let title, type;
let pageNumber = 1;

async function getCinemaInfo(url) {
    const response = await fetch(url);
    return await response.json();
}

function processSearchResults(searchResults) {
    for (const cinemainfo of searchResults) {

        const {Poster, Title, Type, Year, imdbID} = cinemainfo;

        const cinemaCard = 
        `<div class="cinema-card" data-imdbid=${imdbID}>
            <img src="${Poster}" alt="Poster of ${Title}" class="poster">
            <div class="info">
                <p class="type">${Type}</p>
                <h6 class="title">${Title}</h6>
                <p class="year">${Year}</p>
            </div>
        </div>`;

        resultContainer.insertAdjacentHTML(`beforeend`, cinemaCard);
    }
};

searchBtn.addEventListener(`click`, async function(event) {
    event.preventDefault();
    searchStatus.hidden = false;
    
    if (!searchingName.value) { 
        searchStatus.innerText = `Empty title\nPleace enter ones`;
        return;
    }

    if (searchingName.value == title && searchingType.value == type) {
        searchStatus.innerText = `Repeated title and type\nEnter new ones`
        return;
    }

    title = searchingName.value;
    type = searchingType.value;

    if (!regexp.test(searchingName.value)) {
        searchStatus.innerText = `Not correct simbols in title\nPlease enter valid one`
        return;
    }
    
    searchingName.value = ``;
    searchStatus.innerText = `Search for ${type}\n "${title}"`

    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${title}&type=${type}`;
    const results = await getCinemaInfo(url);

    if (results.Response == `False`) {
        searchStatus.innerText = results.Error.replace(`.`,``) + 
        `\nPlease enter more specific title`;
        return;
    }

    const searchResults = results.Search;
    console.log('searchResults :>> ', searchResults);
    
    processSearchResults(searchResults);
});
  


document.addEventListener(`scroll`,async function() {

    const availScrollHeight = document.documentElement.scrollHeight - 
    document.documentElement.clientHeight;
    
    const currentScrollPosition = Math.ceil(window.pageYOffset);
    
    if (currentScrollPosition >= 230) {
        searchStatus.classList.add(`sticky`);
    } else {
        searchStatus.classList.remove(`sticky`);
    }
    
    if (currentScrollPosition >= availScrollHeight) {
        pageNumber += 1;
        const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${title}&type=${type}&page=${pageNumber}`;
        const results = await getCinemaInfo(url);
        const searchResults = results.Search;
        
        processSearchResults(searchResults); 
    }
});

resultContainer.addEventListener(`click`,async function(event) {
    const cinemaCard = event.target.closest(`.cinema-card`);
    if (cinemaCard) {
        const imdbID = cinemaCard.dataset.imdbid;
        const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`;
        const cinemainfo = await getCinemaInfo(url);
        const {Poster, Title, Type, Year, Genre, Actors, Plot} = cinemainfo;
        
        const cinemaFullCard = 
            `<div id="fixed-container">
                <div class="cinema-full-card">
                    <img src="${Poster}" alt="Poster of ${Title}" class="poster">
                    <div class="info">
                        <p class="type">${Type}</p>
                        <h6 class="title">${Title}</h6>
                        <h6 class="genre">${Genre}</h6>
                        <p class="year">${Year}</p>
                        <p class="actors">${Actors}</p>
                        <p class="plot">${Plot}</p>
                    </div>
                    <button>&times;</button>
                </div>
            </div>`;

        document.body.insertAdjacentHTML(`beforeend`, cinemaFullCard);

        document.querySelector(`.cinema-full-card button`).addEventListener(`click`, function() {
            document.querySelector(`.cinema-full-card`).remove();
        });
    }
});