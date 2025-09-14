import React from 'react';
import { Users, Calendar, Clock, MapPin, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';

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
const formatDateWithDay = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[date.getDay()];
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    
    return `${dayName}, ${month} ${day}`;
  } catch (error) {
    return dateString;
  }
};

// Helper function to format time to 12-hour format
const formatTime = (timeString: string) => {
  try {
    const [hours, minutes] = timeString.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  } catch (error) {
    return timeString;
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
  const [showParticipants, setShowParticipants] = React.useState(false);

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

  const handleViewParticipants = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowParticipants(true);
  };

  const handleCardClick = () => {
    onClick();
  };

  return (
  <div className="relative">
    <div
      onClick={handleCardClick}
      className={`
        p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 h-48 min-h-[12rem]
        ${joined 
          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
          : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-lg'
        }
        border-2 ${joined ? 'border-transparent' : 'border-gray-100 hover:border-purple-200'}
      `}
    >
      {/* Menu Button */}
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

      {/* Radio Button */}
      <div className="your-radio-classes">
        {/* Radio button content */}
      </div>

    </div>
  </div>
);
}