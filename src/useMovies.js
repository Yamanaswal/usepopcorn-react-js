import { useEffect, useState } from "react";

const KEY = "da775201";

export function useMovies(query, onCloseMovieCallback) {

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [movies, setMovies] = useState([]);

    useEffect(function () {

        /* javascript method to cancel request to avoid race condition. */
        const controller = new AbortController();


        if (query.length < 3) {
            setMovies([]);
            setError("Search Movie in Search Bar.");
            return;
        }

        fetchMovies(query, controller);

        /* Clean Up Function - Called when re-render component. */
        return function () {
            controller.abort();
        }
    }, [query]);

    async function fetchMovies(query, controller) {
        try {

            //optional callback => ?.
            onCloseMovieCallback?.();
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


    return { movies, isLoading, error };

}