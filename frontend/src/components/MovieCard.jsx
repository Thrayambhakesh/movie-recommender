export default function MovieCard({ movie }) {
  const rating =
    movie.avg_rating !== undefined
      ? Math.round(movie.avg_rating * 10) / 10
      : "N/A";

  return (
    <div className="border p-4 w-80 rounded-lg shadow">
      <h2 className="text-lg font-bold">{movie.title}</h2>

      <p className="mt-2 text-sm text-gray-600">
        ⭐ Rating: <span className="font-semibold">{rating}</span>
      </p>

      {movie.genres && (
        <p className="text-xs mt-1 text-gray-500">
          {movie.genres}
        </p>
      )}
    </div>
  );
}
