import React from 'react';
import { Users, Calendar, Clock, MapPin, User, MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface VibeCardProps {
  emoji: string;
  title: string;
  date?: string;
  time?: string;
  venue?: string;
  count: number;
  participantNames: string[];
  joined: boolean;
  isCreatedByCurrentUser: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
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
export default function VibeCard({ 
  emoji, 
  title, 
  date, 
  time, 
  venue, 
  count, 
  participantNames, 
  joined, 
  isCreatedByCurrentUser,
  onEdit,
  onDelete,
  onClick 
}: VibeCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.();
  };

  console.log('VibeCard props:', { isCreatedByCurrentUser, onEdit, onDelete }); // Debug log
  return (
    <div className="relative">
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
        {/* Menu Button - Always show for debugging */}
        <div>
          <button
            onClick={handleMenuClick}
            className={`absolute top-2 left-2 p-1 rounded-full transition-colors z-10 ${
              joined 
                ? 'text-white hover:bg-white/20' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <MoreVertical size={16} />
          </button>
        </div>

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

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute top-8 left-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[100px]">
          <button
            onClick={handleEdit}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-t-lg"
          >
            <Edit2 size={14} />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-lg"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}