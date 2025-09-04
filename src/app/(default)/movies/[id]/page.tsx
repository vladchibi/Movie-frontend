import Image from "next/image";
import { Star } from "lucide-react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import MovieDetailClient from "./MovieDetailClient";
import { CommentList } from "@/components/comments";
import { Movie } from "@/types/global-type";
import { Comment } from "@/types/types";


interface PageProps {
  params: {
    id: string;
  };
}

// Fetch movie data at build time
async function getMovie(id: string): Promise<Movie | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movies/${id}`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return data.data?.data || data.data || data || null;
  } catch (error) {
    console.error('Error fetching movie:', error);
    return null;
  }
}

// Fetch initial comments for the movie
async function getMovieComments(movieId: string): Promise<Comment[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/movie-review/movie/${movieId}?page=1&limit=10&sortBy=newest`,
      { next: { revalidate: 300 } } 
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data?.data || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const movie = await getMovie(params.id);

  if (!movie) {
    return {
      title: 'Không tìm thấy phim',
      description: 'Bộ phim được yêu cầu không thể tìm thấy.',
    };
  }

  return {
    title: `${movie.title}`,
    description: movie.synopsis || `Xem ${movie.title} tại rạp. Đặt vé ngay bây giờ!`,
    keywords: [
      movie.title,
      ...(movie.genres || []),
      'phim',
      'rạp chiếu phim',
      'vé phim',
      'đặt vé'
    ].join(', '),
    openGraph: {
      title: movie.title,
      description: movie.synopsis || `Xem ${movie.title} tại rạp`,
      images: movie.posterPath ? [movie.posterPath] : [],
      type: 'video.movie',
    },
    twitter: {
      card: 'summary_large_image',
      title: movie.title,
      description: movie.synopsis || `Xem ${movie.title} tại rạp`,
      images: movie.posterPath ? [movie.posterPath] : [],
    },
  };
}

// Generate static paths for popular movies
export async function generateStaticParams() {
  // For now, return empty array to use dynamic rendering
  // This can be enabled later when API is stable
  return [];
}

export default async function MovieDetail({ params }: PageProps) {
  const [movie, initialComments] = await Promise.all([
    getMovie(params.id),
    getMovieComments(params.id)
  ]);

  if (!movie) {
    notFound();
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Movie backdrop */}
      <div className="relative h-72 md:h-96 w-full">
        <Image
          src={movie.backdropPath || '/placeholder-movie.jpg'}
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold">{movie.title}</h1>
          <div className="flex items-center mt-2 text-sm md:text-base space-x-4">
            <p className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
              {movie.rating?.toFixed(1) || 'N/A'}/10
            </p>
            <p>{movie.duration}</p>
            <p>{movie.genres?.map((genre) => genre.genre.name).join(', ') || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie info column */}
          <div className="lg:col-span-2">
            {/* Trailer */}
            {movie.trailerUrl && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Trailer</h2>
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={movie.trailerUrl.replace('watch?v=', 'embed/')}
                    title={`${movie.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                </div>
              </div>
            )}

            {/* Synopsis */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Nội dung</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {movie.synopsis || 'No synopsis available.'}
              </p>
            </div>

            {/* Details */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Thông tin chi tiết</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Đạo diễn</p>
                  <p>{movie.director || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Ngày phát hành</p>
                  <p>{movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-gray-500 dark:text-gray-400">Diễn viên</p>
                  <p>{movie.actors || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Showtimes column - Client-side component */}
          <MovieDetailClient movieId={movie.id} />
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <CommentList movieId={movie.id} initialComments={initialComments} />
        </div>
      </div>
    </div>
  );
}