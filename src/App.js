import { useState, useEffect } from "react";
import StarRating from "./StarRating";


const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);


function NavBar({ children }) {

  return (
    <nav className="nav-bar">
      <PopCornLogo />
      {children}
    </nav>
  );
}

function SearchBar({ query, setQuery }) {

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function PopCornLogo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function MoviesNumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {

  return (

    <main className="main">
      {children}
    </main>
  );

}

function WatchedMoviesList({ watched, onDeleteWatched }) {

  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
function MovieSummary({ watched }) {

  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));


  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function BoxList({ children }) {

  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">

      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}

    </div>
  );
}


function Movies({ movies, handleSelectMovie, selectedId }) {

  return (
    <div style={{ height: '400px', overflow: 'auto' }} className="movies">
      <ul className="list list-movies">
        {movies?.map((movie) => (
          <Movie movie={movie} key={movie.imdbID} handleSelectMovie={handleSelectMovie} selectedId={selectedId} />
        ))}
      </ul>
    </div>
  );
}

function Movie({ movie, handleSelectMovie, selectedId }) {

  return (
    <li key={movie.imdbID}
      onClick={() => { handleSelectMovie(movie.imdbID) }}
      className={`${selectedId === movie.imdbID} ? "" : "selected-tile"`}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

const KEY = "da775201";

export default function App() {

  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }

  function onCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(function () {
    /* javascript method to cancel request to avoid race condition. */
    const controller = new AbortController();


    if (query.length < 3) {
      setMovies([]);
      setError("Search Movie in Search Bar.");
      return;
    }

    onCloseMovie();
    fetchMovies(query, controller);

    /* Clean Up Function - Called when re-render component. */
    return function () {
      controller.abort();
    }
  }, [query]);

  async function fetchMovies(query, controller) {
    try {

      setIsLoading(true);
      setError("");

      const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&s=${query}`, { signal: controller.signal });

      if (!res.ok) {
        throw new Error(`Fetching movies failed.`);
      }

      const response = await res.json();

      if (response.Response === 'False') {
        throw new Error(`Movie not found.`);
      }

      console.log(response);
      setMovies(response.Search);
      setError("");

    } catch (error) {

      if (error.name !== "AbortError") {
        console.log(error.message);
        setError(error.message);
      }

    } finally {
      setIsLoading(false);
    }
  }


  return (
    <>
      <NavBar>
        <SearchBar query={query} setQuery={setQuery} />
        <MoviesNumResults movies={movies} />
      </NavBar>

      <Main>
        <BoxList>
          {moviesList()}
        </BoxList>

        <BoxList>
          {watchedMoviesList()}
        </BoxList>
      </Main>
    </>
  );

  function moviesList() {
    if (isLoading) {
      return <Loader />;
    } else {
      if (error) {
        return <ErrorMessage message={error} />
      } else {
        return <Movies movies={movies} handleSelectMovie={handleSelectMovie} selectedId={selectedId} />;
      }
    }
  }

  function watchedMoviesList() {
    if (selectedId) {
      return <MovieDetails
        selectedId={selectedId}
        onCloseMovie={onCloseMovie}
        onAddWatched={handleAddWatched}
        watched={watched}
      />
    } else {
      return (<>
        <MovieSummary watched={watched} />
        <WatchedMoviesList
          watched={watched}
          onDeleteWatched={handleDeleteWatched} />
      </>)
    }
  }


}


function MovieDetails({ selectedId, onCloseMovie, watched, onAddWatched }) {

  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const [error, setError] = useState("");

  const {
    Title: title,
    Year: year,
    Rated: rated,
    Released: released,
    Runtime: runtime,
    Genre: genre,
    Director: director,
    Writer: writer,
    Actors: actors,
    Plot: plot,
    Language: language,
    Country: country,
    Awards: awards,
    Poster: poster,
    Ratings: ratings,
    Metascore: metascore,
    imdbRating: imdbRating,
    imdbVotes: imdbVotes,
    imdbID: imdbID,
    Type: type,
    DVD: dvd,
    BoxOffice: boxOffice,
    Production: production,
    Website: website,
  } = movie;


  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;


  useEffect(() => {

    function escapeCallback(e) {

      //Keyboard Esc Button
      if (e.code === 'Escape') {
        onCloseMovie()
      }

    }
    //Adding Listener.
    document.addEventListener("keydown", escapeCallback);

    //Clean Up Effect. 
    //Note: Called After UnMounted
    return function () {

      //Remove Listener.
      document.removeEventListener("keydown", escapeCallback);
    }

  }, [onCloseMovie]);

  useEffect(() => {
    getMoviesDetails(selectedId);
  }, [selectedId]);


  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;

    /* Clean Up Function - Called when UnMount */
    return function () {
      document.title = "usePorcorn";
      console.log(`Clean up effect for movie ${title}`);
    }

  }, [title]);

  async function getMoviesDetails(id) {
    try {

      setIsLoading(true);
      setError("");

      const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&i=${id}`);

      if (!res.ok) {
        throw new Error(`Fetching movies details failed.`);
      }

      const response = await res.json();

      if (response.Response === 'False') {
        throw new Error(`Movie details not found.`);
      }

      console.log(response);
      setMovie(response);

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }


  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      // countRatingDecisions: countRef.current,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }


  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    starSize={20}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated with movie {watchedUserRating} <span>⭐️</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>)
}


function Loader() {
  return (
    <p className="loader">Loading....</p>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}