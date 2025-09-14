import React from 'react';
import { Users, Calendar, Clock, MapPin, User } from 'lucide-react';

interface VibeCardProps {
  emoji: string;
  title: string;
  date?: string;
  time?: string;
  venue?: string;
  count: number;
  participantNames: string[];
  joined: boolean;
  onClick: () => void;
}

// Helper function to format date with day name
const formatDateWithDay = (dateString: string, timeString?: string) => {
  try {
    const date = new Date(dateString);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[date.getDay()];
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    
    let formatted = `${dayName}, ${month} ${day}`;
    if (timeString) {
      // Convert 24-hour time to 12-hour format
      const [hours, minutes] = timeString.split(':');
      const hour12 = parseInt(hours) % 12 || 12;
      const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
      formatted += ` at ${hour12}:${minutes} ${ampm}`;
    }
    return formatted;
  } catch (error) {
    return dateString + (timeString ? ` at ${timeString}` : '');
  }
};
export default function VibeCard({ emoji, title, date, time, venue, count, participantNames, joined, onClick }: VibeCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95
        ${joined 
          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
          : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-lg'
        }
        border-2 ${joined ? 'border-transparent' : 'border-gray-100 hover:border-purple-200'}
      `}
    >
      <div className="text-center">
        <div className="text-3xl mb-2">{emoji}</div>
        <h3 className={`font-semibold text-base mb-2 ${joined ? 'text-white' : 'text-gray-800'}`}>
          {title}
        </h3>
        
        {/* Date/Time and Venue Info */}
        <div className={`space-y-1 mb-3 text-xs ${joined ? 'text-purple-100' : 'text-gray-600'}`}>
          {date && (
            <div className="flex items-center justify-center space-x-1">
              <Calendar size={12} />
              <span>{formatDateWithDay(date, time)}</span>
            </div>
          )}
          {venue && (
            <div className="flex items-center justify-center space-x-1">
              <MapPin size={12} />
              <span className="truncate">{venue}</span>
            </div>
          )}
        </div>
        
        {/* Participants Count */}
        <div className={`text-sm mb-2 ${joined ? 'text-purple-100' : 'text-gray-500'}`}>
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Users size={16} />
            <span>{count} {count === 1 ? 'person' : 'people'}</span>
          </div>
        </div>
        
        {/* Participant Names */}
        {participantNames && participantNames.length > 0 && (
          <div className={`text-xs ${joined ? 'text-purple-100' : 'text-gray-500'}`}>
            <div className="text-center leading-tight">
              {participantNames.length <= 4 ? (
                <span>{participantNames.join(', ')}</span>
              ) : (
                <span>
                  {participantNames.slice(0, 3).join(', ')} +{participantNames.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {joined && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
}