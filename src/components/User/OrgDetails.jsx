import React, { useEffect, useState } from "react";
import orgimg from "../../assets/website/org/Association of Civil Engineering Students of TUP Taguig Campus(ACES).jpg";
import eventBG from "../../assets/website/eventBG.png";
import Loader from "../Layouts/Loader.jsx";

const apiUrl = import.meta.env.VITE_API_URL;

function OrgDetails() {
  const [orgDetails, setOrgDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const organizationId = localStorage.getItem("selectedOrgId");
        if (!organizationId) {
          throw new Error("Organization ID not found in local storage.");
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        // Fetch organization details
        const orgRes = await fetch(`${apiUrl}organizations/${organizationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!orgRes.ok) {
          throw new Error("Failed to fetch organization details.");
        }

        const orgData = await orgRes.json();

        // Fetch events
        const eventsRes = await fetch(`${apiUrl}organizations/${organizationId}/events`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!eventsRes.ok) {
          throw new Error("Failed to fetch organization events.");
        }

        const eventsData = await eventsRes.json();

        // Combine details and events
        setOrgDetails({ ...orgData, events: eventsData.events || [] });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, []);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col">
      {/* Organization Banner */}
      <section
        className="w-full h-[70vh] flex justify-center items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${eventBG})` }}
      >
        <div className="max-w-[190vh] w-full px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <h2 className="text-[8vh] sm:text-[4vh] md:text-[6vh] lg:text-[6vh] xl:text-[8vh] font-semibold text-[#3a1078] leading-none uppercase">
              {orgDetails.name}
            </h2>
            <p className="text-black text-base md:text-lg">{orgDetails.description}</p>
          </div>
          <div className="flex justify-center md:justify-end">
            <img
              className="w-full max-w-xs sm:max-w-[30vh] md:max-w-[20vh] lg:max-w-[40vh] object-cover rounded-full"
              src={orgDetails.image || orgimg}
              alt="Organization Image"
            />
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="w-full flex flex-col items-center bg-[#f7f7f8] py-16">
        <div className="max-w-[190vh] w-full px-6 md:px-10">
          <h2 className="text-[6vh] sm:text-[6vh] md:text-[4vh] lg:text-[6vh] font-medium text-[#3a1078] leading-none uppercase text-center md:text-left mb-8">
            Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {orgDetails.events.length > 0 ? (
              orgDetails.events.map((event) => (
                <div
                  key={event._id}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleEventClick(event)}
                >
                  <img
                    className="w-[30vh] h-[30vh] object-cover rounded-lg"
                    src={event.images || orgimg}
                    alt={event.name}
                  />
                  <h3 className="text-lg font-semibold text-[#3a1078] mt-4 text-center">{event.name}</h3>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic col-span-full text-center">No events available</p>
            )}
          </div>
        </div>
      </section>

      {/* Officers Section */}
      <section className="w-full flex flex-col items-center bg-[#f7f7f8] py-16">
        <div className="max-w-[190vh] w-full px-6 md:px-10">
          <h2 className="text-[6vh] sm:text-[6vh] md:text-[4vh] lg:text-[6vh] font-medium text-[#3a1078] leading-none uppercase text-center md:text-left mb-8">
            Officers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {orgDetails.officers && orgDetails.officers.length > 0 ? (
              orgDetails.officers.map((officer) => (
                <div key={officer._id} className="flex flex-col items-center">
                  <img
                    className="w-[30vh] h-[30vh] object-cover rounded-lg"
                    src={officer.image || orgimg}
                    alt={officer.name}
                  />
                  <h3 className="text-lg font-semibold text-[#3a1078] mt-4 text-center">{officer.name}</h3>
                  <p className="text-md text-gray-700 mt-2">{officer.position}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic col-span-full text-center">No officers listed</p>
            )}
          </div>
        </div>
      </section>

      {/* Event Modal */}
      {modalVisible && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4">{selectedEvent.name}</h2>
            <p className="text-gray-700 mb-4">{selectedEvent.description}</p>
            <p className="text-gray-700 mb-4">
              {new Date(selectedEvent.dateStart).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })}{" "}
              to{" "}
              {new Date(selectedEvent.dateEnd).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })}{" "}
              @ {selectedEvent.location}
            </p>
            <button className="bg-[#3a1078] text-white px-4 py-2 rounded hover:bg-[#5a20a2]" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrgDetails;
