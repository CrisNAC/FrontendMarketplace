import { CommentCard } from './CommentCard';

export const CommentsList = ({ comments = [] }) => {
  // Datos de ejemplo si no hay comentarios
  const defaultComments = [
    {
      id: 1,
      author: 'Tamara',
      rating: 5,
      title: '10/10 would recommend!!',
      content: 'great phone, came with apple charging cord, no scratches, no imperfections!! Beautiful color!! Perfect condition! Would definitely buy other phones from this seller! I was a little skeptical, but it really is in perfect condition!!',
      verified: true,
      location: 'Estados Unidos',
      date: 'el 12 de agosto de 2025',
      productDetails: {
        'Tamaño': '128GB',
        'Color': 'Rosado'
      }
    },
    {
      id: 2,
      author: 'Tamara',
      rating: 5,
      title: '10/10 would recommend!!',
      content: 'great phone, came with apple charging cord, no scratches, no imperfections!! Beautiful color!! Perfect condition! Would definitely buy other phones from this seller! I was a little skeptical, but it really is in perfect condition!!',
      verified: true,
      location: 'Estados Unidos',
      date: 'el 12 de agosto de 2025',
      productDetails: {
        'Tamaño': '128GB',
        'Color': 'Rosado'
      }
    },
    {
      id: 3,
      author: 'Tamara',
      rating: 5,
      title: '10/10 would recommend!!',
      content: 'great phone, came with apple charging cord, no scratches, no imperfections!! Beautiful color!! Perfect condition! Would definitely buy other phones from this seller! I was a little skeptical, but it really is in perfect condition!!',
      verified: true,
      location: 'Estados Unidos',
      date: 'el 12 de agosto de 2025',
      productDetails: {
        'Tamaño': '128GB',
        'Color': 'Rosado'
      }
    }
  ];

  const commentsToShow = comments.length > 0 ? [...comments, ...defaultComments] : defaultComments;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-0">
        {commentsToShow.length > 0 ? (
          commentsToShow.map(comment => (
            <CommentCard 
              key={comment.id}
              {...comment}
              onReport={() => console.log('Reportar comentario:', comment.id)}
            />
          ))
        ) : (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-10 text-center text-gray-600">
            <p className="m-0">No hay comentarios</p>
          </div>
        )}
      </div>
    </div>
  );
};