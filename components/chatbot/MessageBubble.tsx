import { Message, Movie, Showtime } from '../../types/types';
import { MovieCard } from './MovieCard';

interface MessageBubbleProps {
  message: Message;
}

const isShowtime = (item: Movie | Showtime): item is Showtime => {
  return 'movie' in item && 'theater' in item && 'date' in item && 'time' in item;
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  if(message.data) {
    console.log(message.data);
  }
  return (
    <div
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className="space-y-2">
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
            message.sender === 'user'
              ? 'bg-primary-500 text-white rounded-br-md'
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-bl-md'
          }`}
        >
          <p className="text-sm">{message.text}</p>
          <p className={`text-xs mt-1 ${
            message.sender === 'user' ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {message.timestamp.toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
        
        {message.sender === 'bot' && message.data && message.data.length > 0 && (
          <div className="space-y-2 max-w-xs lg:max-w-md">
            {message.data.map((item) => {
              if (isShowtime(item)) {
                return (
                  <MovieCard
                    key={`showtime-${item.id}`}
                    showtime={item}
                    displayMode="showtime"
                  />
                );
              } else {
                return (
                  <MovieCard
                    key={`movie-${item.id}`}
                    movie={item}
                    displayMode="movie"
                  />
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};
