import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, Search, Users, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { teamsAPI, usersAPI } from '../services/api';

const CreateTeam = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);

  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    const filtered = availableUsers.filter(user => {
      const alreadySelected = selectedMembers.some(m => m._id === user._id);
      if (alreadySelected) return false;

      const searchLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.roll_no.toLowerCase().includes(searchLower)
      );
    });
    setFilteredUsers(filtered);
  }, [searchTerm, availableUsers, selectedMembers]);

  const fetchAvailableUsers = async () => {
    setIsLoading(true);
    try {
      const response = await usersAPI.getUsers({ limit: 1000 });
      if (response.success && response.users) {
        setAvailableUsers(response.users);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      toast.error('Error fetching users');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = (user) => {
    setSelectedMembers([...selectedMembers, user]);
    setSearchTerm('');
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(m => m._id !== userId));
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    if (!teamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error('Please add at least one member to the team');
      return;
    }

    setIsSubmitting(true);
    try {
      const teamData = {
        name: teamName.trim(),
        description: description.trim(),
        memberIds: selectedMembers.map(m => m._id)
      };

      const response = await teamsAPI.createTeam(teamData);

      if (response.success) {
        toast.success('Team created successfully!');
        navigate('/teams');
      } else {
        toast.error(response.error || 'Failed to create team');
      }
    } catch (error) {
      toast.error('Error creating team');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/teams')}
            className="p-2 hover:bg-white rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-indigo-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Team</h1>
            <p className="text-gray-600 mt-1">Build a team and manage attendance efficiently</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleCreateTeam}>
            {/* Team Name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Team Name *
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g., Project A Team, Development Squad"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter team description..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
              />
            </div>

            {/* Add Members Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Add Team Members *
                </label>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowUserSearch(!showUserSearch)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Member
                </motion.button>
              </div>

              {/* User Search Input */}
              {showUserSearch && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or roll number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      autoFocus
                    />
                  </div>

                  {/* Users Dropdown */}
                  {searchTerm && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto z-20"
                    >
                      {isLoading ? (
                        <div className="p-4 text-center">
                          <Loader className="w-5 h-5 animate-spin mx-auto text-indigo-600" />
                        </div>
                      ) : filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                          <motion.button
                            key={user._id}
                            type="button"
                            onClick={() => handleAddMember(user)}
                            whileHover={{ backgroundColor: '#f3f4f6' }}
                            className="w-full p-3 text-left border-b border-gray-200 last:border-b-0 transition hover:bg-gray-100"
                          >
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-600">{user.roll_no} • {user.email}</div>
                          </motion.button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">No matching users found</div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Selected Members ({selectedMembers.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map(member => (
                      <motion.div
                        key={member._id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-indigo-300 shadow-sm"
                      >
                        <span className="text-sm font-medium text-gray-700">{member.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member._id)}
                          className="p-1 hover:bg-red-100 rounded transition"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMembers.length === 0 && (
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No members added yet. Click "Add Member" to get started.</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating Team...
                </div>
              ) : (
                'Create Team'
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateTeam;
