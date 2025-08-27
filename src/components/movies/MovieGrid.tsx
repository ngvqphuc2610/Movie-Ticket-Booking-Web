import React from 'react';
import MovieCard, { MovieProps } from './MovieCard';

interface MovieGridProps {
  title: string;
  movies: MovieProps[];
  className?: string;
}

export default function MovieGrid({ title, movies, className = '' }: MovieGridProps) {
    const validMovies = movies.filter(
    (movie) => !movie.endDate || new Date(movie.endDate) >= new Date()
  );

  return (
    <div className={`py-8 ${className}`}>
      {title && <h2 className="text-2xl md:text-3xl text-center font-bold mb-6 ">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  gap-4 md:gap-8">
        {validMovies.map((movie) => (
          <MovieCard key={movie.id} {...movie} />
        ))}
      </div>
    </div>
  );
}