export const RatingsDistribution = ({ ratings = {} }) => {
  const totalRatings = Object.values(ratings).reduce((a, b) => a + b, 0);
  
  const ratingData = {
    5: ratings[5] || 56,
    4: ratings[4] || 33,
    3: ratings[3] || 11,
    2: ratings[2] || 0,
    1: ratings[1] || 0,
  };

  const averageRating = (
    (ratingData[5] * 5 + ratingData[4] * 4 + ratingData[3] * 3 + ratingData[2] * 2 + ratingData[1] * 1) /
    (totalRatings || 1)
  ).toFixed(2);

  return (
    <div className="bg-transparent p-5">
      {/* Sección de promedio */}
      <div className="mb-5 pb-5 border-b border-gray-200">
        <div className="text-4xl font-bold text-orange-500 mb-3">
          {averageRating}
        </div>
        
        <div className="flex gap-1 mb-3 text-lg">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={i < Math.round(averageRating) ? 'text-orange-500' : 'text-gray-300'}
            >
              ★
            </span>
          ))}
        </div>
        
        <div className="text-sm text-gray-600">
          {totalRatings} calificaciones globales
        </div>
      </div>

      {/* Barras de distribución */}
      <div className="flex flex-col gap-2.5">
        {[5, 4, 3, 2, 1].map((stars) => {
          const percentage = totalRatings > 0 ? (ratingData[stars] / totalRatings) * 100 : 0;
          return (
            <div key={stars} className="grid grid-cols-[70px_1fr_45px] gap-3 items-center">
              <span className="text-xs text-blue-600">
                {stars} estrella{stars !== 1 ? 's' : ''}
              </span>
              
              <div className="h-5 bg-gray-200 rounded overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <span className="text-xs text-gray-600 text-right">
                {Math.round(percentage)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};