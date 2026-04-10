import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../services/api';

const CreateEvent = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'Event',
    date: '',
    time: '',
    location: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.title.trim()) {
      errors.push('Title is required');
    } else if (formData.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long');
    }

    if (!formData.date) {
      errors.push('Date is required');
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.push('Date cannot be in the past');
      }
    }

    if (!formData.time) {
      errors.push('Time is required');
    }

    if (!formData.location.trim()) {
      errors.push('Location is required');
    } else if (formData.location.trim().length < 3) {
      errors.push('Location must be at least 3 characters long');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Event created successfully!');
        navigate('/admin');
      } else {
        toast.error(result.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Create event error:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          
          <div className="w-20"></div>
        </motion.div>

        {/* Create Event Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-gray-200 rounded-md p-8"
        >
          <div className="flex items-center space-x-4 mb-8">
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
              <p className="text-gray-600">Fill in the details to create a new event</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={150}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/150 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter event description (optional)"
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Event Type *
              </label>
              <select
                name="event_type"
                value={formData.event_type}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Event">Event</option>
                <option value="TNP Meeting">TNP Meeting</option>
              </select>
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter event location"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={200}
              />
            </div>

            {/* Form Preview */}
            {formData.title && formData.date && formData.time && formData.location && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-md p-4"
              >
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Event Preview
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-blue-800">Title:</span>
                    <span className="text-blue-700">{formData.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-blue-800">Type:</span>
                    <span className="text-blue-700">{formData.event_type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-blue-800">Date & Time:</span>
                    <span className="text-blue-700">
                      {formData.date} at {formData.time}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-blue-800">Location:</span>
                    <span className="text-blue-700">{formData.location}</span>
                  </div>
                  {formData.description && (
                    <div className="flex items-start space-x-2">
                      <span className="font-medium text-blue-800">Description:</span>
                      <span className="text-blue-700">{formData.description}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating Event...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Create Event</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex-1 bg-gray-600 text-white py-3 rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Tips */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center space-x-2 text-yellow-800 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Tips for creating events:</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Choose a clear and descriptive title</li>
                <li>• Provide a detailed description to help students understand the event</li>
                <li>• Select the appropriate event type (Event or TNP Meeting)</li>
                <li>• Ensure the date is not in the past</li>
                <li>• Provide a specific location for easy navigation</li>
              </ul>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateEvent;
