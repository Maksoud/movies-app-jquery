const API_KEY  = "04c35731a5ee918f014970082a0088b1";
const API_BASE = "https://api.themoviedb.org/3";
const IMGPATH  = "https://image.tmdb.org/t/p/w500";
const IMG_DEFAULT = "./img-default.jpg";

// Textos da interface em cada idioma suportado
const LANGUAGES = {
    "pt-BR": {
        label: "PT",
        placeholder: "Buscar filmes...",
        popular: "Filmes populares",
        results: (term) => `Resultados para "${term}"`,
        overview: "Sinopse",
        noOverview: "Sinopse não disponível.",
        empty: "Nenhum filme encontrado.",
        error: "Não foi possível carregar os filmes. Tente novamente.",
        loading: "Carregando...",
        more: "Carregar mais"
    },
    "en-US": {
        label: "EN",
        placeholder: "Search movies...",
        popular: "Popular movies",
        results: (term) => `Results for "${term}"`,
        overview: "Overview",
        noOverview: "No overview available.",
        empty: "No movies found.",
        error: "Could not load movies. Please try again.",
        loading: "Loading...",
        more: "Load more"
    },
    "es-ES": {
        label: "ES",
        placeholder: "Buscar películas...",
        popular: "Películas populares",
        results: (term) => `Resultados para "${term}"`,
        overview: "Sinopsis",
        noOverview: "Sinopsis no disponible.",
        empty: "No se encontraron películas.",
        error: "No se pudieron cargar las películas. Inténtalo de nuevo.",
        loading: "Cargando...",
        more: "Cargar más"
    }
};

// Estado atual da listagem
const state = {
    lang: "pt-BR",
    term: "",
    page: 1,
    totalPages: 1,
    requestId: 0
};

const t = () => LANGUAGES[state.lang];

$(document).ready(function () {

    const $langs = $("<nav>").addClass("langs").attr("aria-label", "Idioma");

    $.each(LANGUAGES, (code, texts) => {
        $("<button>")
            .attr({ type: "button", "data-lang": code })
            .text(texts.label)
            .on("click", () => setLanguage(code))
            .appendTo($langs);
    });

    $("body").empty().append(
        $("<header>").append(
            $("<a>").attr({ href: "#", id: "logo" })
                .html('<i class="fas fa-film"></i> Movies App')
                .on("click", (e) => {
                    e.preventDefault();
                    $("#search").val("");
                    loadMovies("");
                }),
            $("<form>").attr({ id: "form", role: "search" }).append(
                $("<input>").attr({ id: "search", type: "search", autocomplete: "off" }).addClass("search")
            ).on("submit", (e) => {
                e.preventDefault();
                loadMovies($("#search").val().trim());
                $("#search").trigger("blur");
            }),
            $langs
        ),
        $("<h2>").attr("id", "list-title"),
        $("<p>").attr("id", "status"),
        $("<main>").attr("id", "main"),
        $("<button>").attr({ id: "more", type: "button" }).hide()
            .on("click", () => fetchPage(state.page + 1))
    );

    setLanguage(state.lang);
});

function setLanguage(code) {
    state.lang = code;
    $("html").attr("lang", code);
    $(".langs button").each(function () {
        $(this).toggleClass("active", $(this).data("lang") === code);
    });
    $("#search").attr("placeholder", t().placeholder);
    $("#more").text(t().more);
    loadMovies(state.term);
}

// Começa uma nova listagem (populares quando o termo estiver vazio)
function loadMovies(term) {
    state.term = term;
    $("#main").empty();
    $("#list-title").text(term ? t().results(term) : t().popular);
    fetchPage(1);
}

async function fetchPage(page) {
    const params = { api_key: API_KEY, language: state.lang, page };
    let url;

    if (state.term) {
        url = `${API_BASE}/search/movie`;
        params.query = state.term;
    } else {
        url = `${API_BASE}/discover/movie`;
        params.sort_by = "popularity.desc";
    }

    // Ignora respostas antigas se outra busca começou nesse meio-tempo
    const requestId = ++state.requestId;

    $("#more").hide();
    $("#status").text(t().loading).show();

    try {
        const resp = await fetch(`${url}?${$.param(params)}`);
        if (!resp.ok) throw new Error(resp.status);
        const data = await resp.json();
        if (requestId !== state.requestId) return;

        state.page = data.page;
        state.totalPages = data.total_pages;

        showMovies(data.results);

        if (!data.results.length && page === 1) {
            $("#status").text(t().empty);
        } else {
            $("#status").hide();
        }
        $("#more").toggle(state.page < state.totalPages);
    } catch (err) {
        if (requestId !== state.requestId) return;
        console.error(err);
        $("#status").text(t().error);
    }
}

function showMovies(movies) {
    movies.forEach((movie) => {
        const { poster_path, title, vote_average, overview, release_date } = movie;
        const year = release_date ? release_date.slice(0, 4) : "";
        const vote = vote_average ? vote_average.toFixed(1) : "–";

        // tabindex permite abrir a sinopse com Tab ou toque no celular
        const $movie = $("<article>").addClass("movie").attr("tabindex", 0).append(
            $("<img>").attr({
                src: poster_path ? IMGPATH + poster_path : IMG_DEFAULT,
                alt: title,
                loading: "lazy"
            }).on("error", function () {
                $(this).off("error").attr("src", IMG_DEFAULT);
            }),
            $("<div>").addClass("movie-info").append(
                $("<h3>").text(title).append(year ? $("<small>").text(year) : null),
                $("<span>").addClass(getClassByRate(vote_average)).text(vote)
            ),
            $("<div>").addClass("overview").append(
                $("<h4>").text(t().overview),
                $("<p>").text(overview || t().noOverview)
            )
        );

        $("#main").append($movie);
    });
}

function getClassByRate(vote) {
    if (vote >= 8) {
        return "green";
    } else if (vote >= 5) {
        return "orange";
    }
    return "red";
}
