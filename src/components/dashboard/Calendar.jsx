import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  Bell, 
  Pin, 
  ChevronLeft, 
  ChevronRight,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import apiService from '../../services/api';

const Calendar = ({ onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'agenda'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'general',
    reminder: false,
    reminderTime: '15'
  });

  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Convert API event format to component format
  const mapApiEventToComponent = (apiEvent) => {
    // Parse date string to Date object
    const eventDate = new Date(apiEvent.date);
    
    // Format time (remove seconds if present)
    let formattedTime = apiEvent.time || '';
    if (formattedTime && formattedTime.includes(':')) {
      const timeParts = formattedTime.split(':');
      formattedTime = `${timeParts[0]}:${timeParts[1]}`;
    }

    return {
      id: apiEvent.id,
      title: apiEvent.event_title,
      description: apiEvent.description || '',
      date: eventDate,
      time: formattedTime,
      type: 'general', // API doesn't have type, default to general
      pinned: false, // API doesn't have pinned, default to false
      completed: false, // API doesn't have completed, default to false
      created_at: apiEvent.created_at,
      updated_at: apiEvent.updated_at
    };
  };

  // Load events from API
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get start and end dates for current month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const startDateStr = formatDateForInput(startDate);
      const endDateStr = formatDateForInput(endDate);

      const response = await apiService.getCalendarEvents({
        start_date: startDateStr,
        end_date: endDateStr,
        limit: 500
      });

      // Map API events to component format
      const mappedEvents = (response.events || []).map(mapApiEventToComponent);
      setEvents(mappedEvents);
    } catch (err) {
      console.error('Error loading calendar events:', err);
      setError(err.message || 'Failed to load calendar events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  // Load events on mount and when month changes
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'hearing':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'deadline':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'notification':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'training':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'hearing':
        return <AlertCircle className="h-4 w-4" />;
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      case 'notification':
        return <Bell className="h-4 w-4" />;
      case 'training':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      setError('Please fill in all required fields (title, date, and time)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const eventData = {
        event_title: newEvent.title,
        description: newEvent.description || '',
        date: newEvent.date,
        time: newEvent.time
      };

      if (editingEvent) {
        // Update existing event
        await apiService.updateCalendarEvent(editingEvent.id, eventData);
      } else {
        // Create new event
        await apiService.createCalendarEvent(eventData);
      }

      // Reload events
      await loadEvents();
      
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        type: 'general',
        reminder: false,
        reminderTime: '15'
      });
      setEditingEvent(null);
      setShowAddEvent(false);
    } catch (err) {
      console.error('Error saving calendar event:', err);
      setError(err.message || 'Failed to save calendar event');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = (eventId) => {
    const event = events.find(e => e.id === eventId);
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;

    setDeleting(true);
    setError(null);
    try {
      await apiService.deleteCalendarEvent(eventToDelete.id);
      // Reload events
      await loadEvents();
      setShowDeleteConfirm(false);
      setEventToDelete(null);
    } catch (err) {
      console.error('Error deleting calendar event:', err);
      setError(err.message || 'Failed to delete calendar event');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || '',
      date: formatDateForInput(event.date),
      time: event.time || '',
      type: event.type || 'general',
      reminder: false,
      reminderTime: '15'
    });
    setShowAddEvent(true);
  };

  const handleTogglePin = (eventId) => {
    // Note: API doesn't support pinned, so this is local-only
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, pinned: !event.pinned } : event
      )
    );
  };

  const handleToggleComplete = (eventId) => {
    // Note: API doesn't support completed, so this is local-only
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, completed: !event.completed } : event
      )
    );
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (day) => {
    if (day) {
      setSelectedDate(day);
      const dayEvents = getEventsForDate(day);
      
      // If date has events, just show them (don't open add modal)
      // If no events, open add event modal with pre-filled date
      if (dayEvents.length === 0) {
        // Pre-fill the date in the new event form
        setNewEvent(prev => ({
          ...prev,
          date: formatDateForInput(day)
        }));
        // Open the add event modal
        setShowAddEvent(true);
      }
      // If events exist, selectedDate is already set, so events section will show
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-0">
          {/* Mobile Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>Calendar</h1>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif' }}>
              Manage your legal events, deadlines, and reminders
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3 sm:gap-0">
          <button
            onClick={() => setShowAddEvent(true)}
            className="flex items-center justify-center px-3 sm:px-4 py-2 text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-xs sm:text-sm"
            style={{ backgroundColor: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Add Event
          </button>
        </div>
      </div>

      {/* Pinned Events */}
      {events.filter(event => event.pinned).length > 0 && (
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <Pin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500" />
            Pinned Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {events.filter(event => event.pinned).map((event) => (
              <div
                key={event.id}
                className={`p-3 sm:p-4 rounded-lg border-2 ${getEventTypeColor(event.type)} ${
                  event.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1.5 sm:mb-2">
                      <div className="flex-shrink-0">{getEventIcon(event.type)}</div>
                      <span className="ml-2 text-xs sm:text-sm font-medium truncate">{event.title}</span>
                    </div>
                    <p className="text-xs sm:text-sm opacity-80 mb-1.5 sm:mb-2 line-clamp-2">{event.description}</p>
                    <div className="flex flex-wrap items-center text-xs opacity-70 gap-1 sm:gap-0">
                      <div className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{formatDate(event.date)}</span>
                    </div>
                      {event.time && (
                        <div className="flex items-center ml-1 sm:ml-2">
                          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>{event.time}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 ml-1 sm:ml-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                      title="Edit"
                    >
                      <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleToggleComplete(event.id)}
                      className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                      title={event.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      <CheckCircle className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${event.completed ? 'text-green-600' : 'text-gray-400'}`} />
                    </button>
                    <button
                      onClick={() => handleTogglePin(event.id)}
                      className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                      title="Unpin"
                    >
                      <Pin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-2 sm:p-4 md:p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 sm:mb-4">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-1 sm:py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {days.map((day, index) => {
                const dayEvents = day ? getEventsForDate(day) : [];
                const isToday = day && day.toDateString() === today.toDateString();
                const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString();

                return (
                  <div
                    key={index}
                    className={`min-h-[60px] sm:min-h-[80px] md:min-h-[100px] p-1 sm:p-2 border border-gray-200 ${
                      day ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
                    } ${isToday ? 'bg-blue-50 border-blue-300' : ''} ${
                      isSelected ? 'bg-blue-100 border-blue-400' : ''
                    }`}
                    onClick={() => handleDateClick(day)}
                  >
                    {day && (
                      <>
                        <div className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                          isToday ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-0.5 sm:space-y-1">
                          {dayEvents.slice(0, 1).map((event) => (
                            <div
                              key={event.id}
                              className={`text-[10px] sm:text-xs p-0.5 sm:p-1 rounded ${getEventTypeColor(event.type)} truncate`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 1 && (
                            <div className="text-[10px] sm:text-xs text-gray-500">
                              +{dayEvents.length - 1}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Events for <span className="text-sm sm:text-base">{formatDate(selectedDate)}</span>
              </h2>
              <button
                onClick={() => {
                  setNewEvent(prev => ({
                    ...prev,
                    date: formatDateForInput(selectedDate)
                  }));
                  setShowAddEvent(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{ backgroundColor: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Add Event
              </button>
            </div>
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm sm:text-base text-gray-500 mb-4">No events scheduled for this date.</p>
                <button
                  onClick={() => {
                    setNewEvent(prev => ({
                      ...prev,
                      date: formatDateForInput(selectedDate)
                    }));
                    setShowAddEvent(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg transition-all duration-200 hover:shadow-lg"
                  style={{ backgroundColor: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}
                >
                  <Plus className="h-4 w-4" />
                  Add Event to This Date
                </button>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 sm:p-4 rounded-lg border ${getEventTypeColor(event.type)} ${
                      event.completed ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1.5 sm:mb-2 flex-wrap">
                          <div className="flex-shrink-0">{getEventIcon(event.type)}</div>
                          <span className="ml-2 text-xs sm:text-sm font-medium truncate">{event.title}</span>
                          {event.pinned && <Pin className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2 text-red-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs sm:text-sm opacity-80 mb-1.5 sm:mb-2 line-clamp-2">{event.description}</p>
                        {event.time && (
                          <div className="flex items-center text-xs sm:text-sm opacity-70">
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            {event.time}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 ml-1 sm:ml-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleToggleComplete(event.id)}
                          className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                          title={event.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          <CheckCircle className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${event.completed ? 'text-green-600' : 'text-gray-400'}`} />
                        </button>
                        <button
                          onClick={() => handleTogglePin(event.id)}
                          className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                          title={event.pinned ? 'Unpin' : 'Pin'}
                        >
                          <Pin className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${event.pinned ? 'text-red-500' : 'text-gray-400'}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#1E65AD' }} />
          <span className="ml-2 text-sm text-gray-600">Loading events...</span>
        </div>
      )}

      {/* Add/Edit Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Enter event description"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="hearing">Court Hearing</option>
                  <option value="deadline">Deadline</option>
                  <option value="notification">Notification</option>
                  <option value="training">Training</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reminder"
                  checked={newEvent.reminder}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, reminder: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="reminder" className="ml-2 text-xs sm:text-sm text-gray-700">
                  Set reminder
                </label>
              </div>

              {newEvent.reminder && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Reminder Time (minutes before)
                  </label>
                  <select
                    value={newEvent.reminderTime}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, reminderTime: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="5">5 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="1440">1 day</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 sm:gap-0 mt-4 sm:mt-6">
              <button
                onClick={() => {
                  setShowAddEvent(false);
                  setEditingEvent(null);
                  setNewEvent({
                    title: '',
                    description: '',
                    date: '',
                    time: '',
                    type: 'general',
                    reminder: false,
                    reminderTime: '15'
                  });
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 w-full sm:w-auto disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto disabled:opacity-50 flex items-center justify-center"
                disabled={loading}
                style={{ backgroundColor: '#1E65AD' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {editingEvent ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingEvent ? 'Update Event' : 'Add Event'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => {
              if (!deleting) {
                setShowDeleteConfirm(false);
                setEventToDelete(null);
              }
            }}
          />
          <div
            className="fixed bg-white rounded-xl shadow-2xl z-50"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw',
              maxWidth: '400px',
              fontFamily: 'Roboto, sans-serif'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2.5 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: '#FEE2E2' }}
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 
                    className="text-lg font-semibold text-gray-900"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Delete Event?
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 sm:p-6">
              <p className="text-sm text-gray-700 mb-4">
                Are you sure you want to delete <strong>"{eventToDelete?.title || 'this event'}"</strong>? 
                <span className="text-xs text-gray-500"> This action cannot be undone.</span>
              </p>
              
              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setEventToDelete(null);
                  }}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteEvent}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg transition-colors text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: deleting ? '#9CA3AF' : '#EF4444',
                    fontFamily: 'Roboto, sans-serif'
                  }}
                >
                  {deleting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </span>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Calendar;
