import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";

const apiUrl = import.meta.env.VITE_API_URL;

const AdminEventList = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${apiUrl}events/events`);
        const data = await response.json();
        setEvents(data);
        setOrganizations([...new Set(data.map(event => event.organization))]);
        setTypes([...new Set(data.map(event => event.type.eventType))]);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = events;
    if (selectedOrganization) {
      filtered = filtered.filter(event => event.organization === selectedOrganization);
    }
    if (selectedType) {
      filtered = filtered.filter(event => event.type.eventType === selectedType);
    }
    setFilteredEvents(filtered);
  }, [selectedOrganization, selectedType, events]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">Admin Event List</h1>
      
      <div className="flex gap-4 mb-6 justify-center">
        <select onChange={(e) => setSelectedOrganization(e.target.value)} className="w-40 p-2 border rounded">
          <option value="">All Organizations</option>
          {organizations.map(org => (
            <option key={org} value={org}>{org}</option>
          ))}
        </select>

        <select onChange={(e) => setSelectedType(e.target.value)} className="w-40 p-2 border rounded">
          <option value="">All Event Types</option>
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredEvents.map(event => (
          <motion.div key={event._id} whileHover={{ scale: 1.05 }}>
            <div className="bg-pink-100 border border-pink-300 shadow-lg rounded-2xl p-4">
              <h2 className="text-lg font-semibold text-pink-700">{event.name}</h2>
              <div className="text-sm text-gray-700 mt-2">
                <p><strong>🎗 Organization:</strong> {event.organization}</p>
                <p><strong>🎭 Type:</strong> {event.type.eventType}</p>
                <p><strong>👩‍💼 Officer:</strong> {event.userId.name}</p>
                <p><strong>📅 Date:</strong> {new Date(event.dateStart).toLocaleDateString()}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminEventList;