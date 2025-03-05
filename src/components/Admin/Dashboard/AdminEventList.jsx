import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const apiUrl = import.meta.env.VITE_API_URL;

const AdminEventList = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${apiUrl}events/events`);
        const data = await response.json();
        setEvents(data);
        setOrganizations([...new Set(data.map((event) => event.organization))]);
        setTypes([...new Set(data.map((event) => event.type.eventType))]);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = events;
    if (selectedOrganization) {
      filtered = filtered.filter(
        (event) => event.organization === selectedOrganization
      );
    }
    if (selectedType) {
      filtered = filtered.filter(
        (event) => event.type.eventType === selectedType
      );
    }
    setFilteredEvents(filtered);
  }, [selectedOrganization, selectedType, events]);

  return (
    <div className="p-4 max-w-full mx-auto">
      <h1 className="text-[8vh] font-bold mb-4 font-tungsten text-[#3a1078]">Admin Event List</h1>

      <div className="flex gap-4 mb-6 justify-center">
        <select
          onChange={(e) => setSelectedOrganization(e.target.value)}
          className="w-40 p-2 border rounded"
        >
          <option value="">All Organizations</option>
          {organizations.map((org) => (
            <option key={org} value={org}>
              {org}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-40 p-2 border rounded"
        >
          <option value="">All Event Types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {filteredEvents.map((event) => (
          <motion.div key={event._id} whileHover={{ scale: 1.05 }}>
            <div
              key={event._id}
              className="rounded-lg overflow-hidden shadow-lg bg-white max-w-full hover:shadow-2xl transition duration-300 ease-in-out mt-5"
            >
              {/* Event Image */}
              {event.images && event.images.length > 0 ? (
                <img
                  className="w-full h-48 object-cover"
                  src={event.images[0]}
                  alt={event.name || "Event Image"}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200"></div> // Placeholder if no image
              )}

              <div className="px-4 py-4">
                <div className="font-bold text-lg mb-2 truncate">
                  {event.name || "No Name"}
                </div>

                <p className="text-gray-700 text-sm mb-2 line-clamp-3">
                  {event.description || "No Description"}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  <span className="font-semibold">Date:</span>{" "}
                  {event.dateStart
                    ? new Date(event.dateStart).toLocaleDateString()
                    : "No Date"}
                </p>
                <p className="text-xs text-gray-600 truncate mb-2">
                  <span className="font-semibold">Location:</span>{" "}
                  {event.location || "No Location"}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  <span className="font-semibold">Type:</span>{" "}
                  {event.type && event.type.eventType
                    ? event.type.eventType
                    : "Unknown"}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminEventList;
