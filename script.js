let GLOBAL = {};

const APIURL        = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&page=1";
const IMGPATH       = "https://image.tmdb.org/t/p/w1280/";
const SEARCHAPI     = "https://api.themoviedb.org/3/search/movie?api_key=04c35731a5ee918f014970082a0088b1&query=";
const gTranslate    = null;
const main          = null;
const movieEl       = null;
const img           = null;
const overview      = null;

$(document).ready(function() {
    
    GLOBAL.gTranslate   = $('<div>').attr('id', 'gtranslate').append(`
                            <!-- GTranslate: https://gtranslate.io/ -->
                            <a href="#" onclick="doGTranslate('pt|en');return false;" title="English" class="gflag nturl" style="background-position:-0px -0px;">
                                <img src="//gtranslate.net/flags/blank.png" height="16" width="16" alt="English" />
                            </a>
                            <a href="#" onclick="doGTranslate('pt|pt');return false;" title="Portuguese" class="gflag nturl" style="background-position:-300px -200px;">
                                <img src="//gtranslate.net/flags/blank.png" height="16" width="16" alt="Portuguese" />
                            </a>
                            <a href="#" onclick="doGTranslate('pt|es');return false;" title="Spanish" class="gflag nturl" style="background-position:-600px -200px;">
                                <img src="//gtranslate.net/flags/blank.png" height="16" width="16" alt="Spanish" />
                            </a>
                            <div id="google_translate_element2"></div>
                        `);
    GLOBAL.main         = $('<main>').attr('id', 'main');
                            
    $('body').html('').append(
        $('<header>').append(
            $(GLOBAL.gTranslate),
            $('<form>').attr('id', 'form').append(
                $('<input>').attr('id', 'search').attr("placeholder", "Search...").addClass('search')
            ).submit( (e) => {
                                e.preventDefault();
                                
                                const searchTerm = $(e.currentTarget).find('.search').val();
                                
                                if (searchTerm) {
                                
                                    getMovies(SEARCHAPI + searchTerm);
                                    
                                    $(e.currentTarget).value = "";
                                    
                                }// if (searchTerm)
                    })
        ),
        $(GLOBAL.main)
    );
    
    // Initially get favorite movies
    getMovies(APIURL);
    
});


async function getMovies(url) {
    
    const resp     = await fetch(url);
    const respData = await resp.json();
    
    showMovies(respData.results);
    
}// getMovies

function showMovies(movies) {
    
    // clear main
    $(GLOBAL.main).html("");
    
    movies.forEach( (movie) => {
        
        const {poster_path, title, vote_average, overview} = movie;
        
        GLOBAL.movieEl = $('<div>').addClass("movie");
    
        //******************//
        
        // Set default img
        GLOBAL.img = "./img-default.jpg";
        
        if (poster_path) {
            GLOBAL.img = IMGPATH + poster_path;
        }// if (poster_path)
    
        //******************//
        
        GLOBAL.overview = "No information";
        
        if (overview) {
            GLOBAL.overview = overview;
        }// if (overview)
    
        //******************//
        
        $(GLOBAL.movieEl).html(`
            <img src="${GLOBAL.img}" alt="${title}">
            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getClassByRate(vote_average)}">${vote_average}</span>
            </div>
            <div class="overview">
                <h4>Overview:</h4>
                ${GLOBAL.overview}
            </div>
        `);
    
        //******************//
        
        $(GLOBAL.main).append(
            $(GLOBAL.movieEl)
        );
        
    });
    
}// showMovies

function getClassByRate(vote) {
    
    if (vote >= 8) {
        return 'green';
    } else if (vote >= 5) {
        return 'orange';
    } else {
        return 'red';
    }// if (vote >= 8)
    
}// getClassByRate