import css from "./App.module.css";
import { type Movie } from "../../types/movie";
import { useEffect, useState } from "react";
import SearchBar from "../SearchBar/SearchBar";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";
import { Toaster, toast } from "react-hot-toast";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getMovies } from "../../services/movieService";
import MovieGrid from "../MovieGrid/MovieGrid";
import ReactPaginate from "react-paginate";


export default function App() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  };

  const { data, isError, isLoading, isSuccess } = useQuery({
    queryKey: ["movies", query, page],
    queryFn: () => getMovies(query, page),
    enabled: query !== "",
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
  if (isSuccess && data && data.results.length === 0) {
    toast.error("No movies found for your request.");
  }
}, [isSuccess, data]);


  const totalPages = data?.total_pages ?? 0;

  const openModal = (movie: Movie) => {
    setIsModalOpen(true);
    setMovie(movie);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMovie(null);
  };

  return (
    <>
      <SearchBar onSubmit={handleSearch} />
      {isSuccess && totalPages > 1 && (
  <ReactPaginate
    pageCount={totalPages}
    pageRangeDisplayed={5}
    marginPagesDisplayed={1}
    onPageChange={(event: { selected: number }) => setPage(event.selected + 1)}
    forcePage={page - 1}
    containerClassName={css.pagination}
    activeClassName={css.active}
    nextLabel="→"
    previousLabel="←"
  />
)}

      {isLoading && <Loader />}
      {isError && <ErrorMessage />}
      {data && data.results.length > 0 && (
        <MovieGrid onSelect={openModal} movies={data.results} />
      )}
      {isModalOpen && movie !== null && (
        <MovieModal onClose={closeModal} movie={movie} />
      )}
      <Toaster />
    </>
  );
}