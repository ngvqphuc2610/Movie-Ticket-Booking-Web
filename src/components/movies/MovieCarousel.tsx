'use client';

import React from 'react';
import MovieCard, { MovieProps } from '@/components/movies/MovieCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { Button } from '@/components/ui/button';
import { SwiperProvider, useSwiper } from '../swiper/SwiperContext';
import SwiperNavigation from '../swiper/SwiperNavigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface MovieCarouselProps {
  title: string;
  movies: MovieProps[];
  className?: string;
  showNavigation?: boolean;
  id?: string;

}

const MovieCarouselInner = ({ title, movies, className = '', showNavigation = true }: MovieCarouselProps) => {
  const { t } = useTranslation();
  const { swiperRef, setCurrentSlide, setTotalSlides } = useSwiper();

  const validMovies = movies.filter(
    (movie) => !movie.endDate || new Date(movie.endDate) >= new Date()
  );

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentSlide(swiper.activeIndex);
  };

  const onSwiper = (swiper: SwiperType) => {
    swiperRef.current = swiper;
    setTotalSlides(validMovies.length);
  };
  // Kiểm tra trạng thái của phim
  const isComingSoon = validMovies.length > 0 && validMovies[0].status === 'coming soon';
  const viewAllLink = isComingSoon ? '/movie/upcoming' : '/movie/showing';

  return (
    <div className={`movie-carousel ${className}`}>
      {title && <h2 className="text-4xl font-bold mb-6 text-center text-white">{title}</h2>}

      {/* Show navigation buttons above Swiper */}
      {showNavigation && <SwiperNavigation showArrows={true} showDots={false} className="mb-4" />}

      <Swiper
        onSwiper={onSwiper}
        onSlideChange={handleSlideChange}
        modules={[Navigation, Pagination]}
        spaceBetween={24}
        slidesPerView={4}
        slidesPerGroup={1}
        speed={500}
        watchSlidesProgress={true}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 16 },
          640: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 24 },
        }}
        navigation={false}
        pagination={false}
      >
        {validMovies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <div className="hover:text-[#EBDB40] transition-transform">
              <MovieCard {...movie} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Show dots below Swiper */}
      {showNavigation && <SwiperNavigation showArrows={false} showDots={true} className="mt-4" />}

      <div className="text-center mt-12">
        <Link href={viewAllLink}>
          <Button variant="default" width="full" className="cinestar-button px-6 py-2">
            {t('movie.viewMore')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

// Wrapper component to provide SwiperContext
export default function MovieCarousel({ title, movies, className = '', showNavigation = true }: MovieCarouselProps) {
  if (!movies || movies.length === 0) {
    return (
      <div className={`py-8 ${className}`}>
        {title && <h2 className="text-2xl md:text-3xl text-center font-bold mb-6">{title}</h2>}
        <div className="flex justify-center items-center h-[300px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <SwiperProvider id={title}>
      <MovieCarouselInner title={title} movies={movies} className={className} showNavigation={showNavigation} />
    </SwiperProvider>
  );
}