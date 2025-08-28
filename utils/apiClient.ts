import MovieDetails from "../models/movieDetails";
import OmdbResponse from "../models/omdbResponse";
import {OMDB_API_KEY} from '@env';

export async function onRequestMovieList(searchValue: string, year: number, type: string, pageNumber: number): Promise<OmdbResponse | null> {
    if (!searchValue && year == 0) return null;

    let yearParam = ``;
    if (year != null || year != 0) {
        yearParam = `&y=${year}`;
    }
    let typeParam = ``;
    if (type != null || type != "") {
        typeParam = `&type=${type}`;
    }

    try {
        const response = await fetch(
            `http://www.omdbapi.com/?s=${searchValue}${yearParam}${typeParam}&page=${pageNumber}&apikey=${OMDB_API_KEY}`
        );
        const data: OmdbResponse = await response.json();

        if (data.Response === "True" && data.Search) {
            return data;
        } else {
            const data: OmdbResponse = {Response: "error 1", Search: [], totalResults: "66"}
            return data;
        }
    } catch (error) {
         const data: OmdbResponse = {Response: `${error}`, Search: [], totalResults: "66"}
        return data;
    }
}

export async function onRequestDetails(id: string): Promise<MovieDetails | null> {
    try {
        const response = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${OMDB_API_KEY}`);
        const data: MovieDetails & { Response: string; Error?: string } = await response.json();
        if (data.Response === 'True') {
            return data;
        } else {
            return null;
        }
    } catch (err) {
        return null;
    }
}