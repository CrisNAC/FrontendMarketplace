import { CommentCard } from './CommentCard';

export const CommentsList = ({ comments = [] }) => {

  const commentsToShow = comments; //comentarios a mostrar

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