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
  ).toFixed(1);

  return (
    <div className="bg-transparent px-4 pt-4 pb-2">
      {/* Promedio - inline: ★★★★☆ 4.4 de 5 */}
      <div className="mb-2 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-0.5 mb-0.5">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={`text-sm ${i < Math.round(averageRating) ? 'text-orange-500' : 'text-gray-300'}`}
            >
              ★
            </span>
          ))}
          <span className="text-sm font-bold text-gray-800 ml-1.5">
            {averageRating} de 5
          </span>
        </div>
        
        <div className="text-xs text-gray-500">
          {totalRatings} calificaciones globales
        </div>
      </div>

      {/* Barras de distribución - compactas */}
      <div className="flex flex-col gap-1">
        {[5, 4, 3, 2, 1].map((stars) => {
          const percentage = totalRatings > 0 ? (ratingData[stars] / totalRatings) * 100 : 0;
          return (
            <div key={stars} className="grid grid-cols-[62px_1fr_32px] gap-2 items-center">
              <span className="text-xs text-blue-600">
                {stars} estrella{stars !== 1 ? 's' : ''}
              </span>
              
              <div className="h-3.5 bg-gray-200 rounded overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <span className="text-xs text-gray-500 text-right">
                {Math.round(percentage)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Cómo funcionan las opiniones */}
      <details className="mt-3 pt-2">
        <summary className="text-xs text-blue-600 cursor-pointer list-none flex items-center justify-between leading-snug">
          <span>Cómo funcionan las opiniones y<br />calificaciones de clientes</span>
          <span className="text-gray-400 text-base ml-2">›</span>
        </summary>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          Las opiniones de clientes, incluidas las valoraciones de productos, ayudan a otros clientes a obtener más información sobre el producto y decidir si es adecuado para ellos.
        </p>
      </details>
    </div>
  );
};