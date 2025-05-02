import React, { useEffect, useState } from "react";
import orgimg from "../../assets/website/org/Association of Civil Engineering Students of TUP Taguig Campus(ACES).jpg";
import eventBG from "../../assets/website/eventBG.png";

const apiUrl = import.meta.env.VITE_API_URL;

function OrgDetails() {
  const [organizationId, setOrgId] = useState(null);
  const [orgDetails, setOrgDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const organizationId = localStorage.getItem("selectedOrgId");
        if (!organizationId) throw new Error("Organization ID not found in local storage.");
    
        const token = localStorage.getItem("authToken");
    
        // Fetch organization details
        const response = await fetch(`${apiUrl}organizations/${organizationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch organization details");
        const data = await response.json();
    
        // Fetch events separately
        const eventsRes = await fetch(`${apiUrl}organizations/${organizationId}/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const eventsData = await eventsRes.json();
    
        // Combine both
        setOrgDetails({ ...data, events: eventsData.events });
      } catch (error) {
        setError(error.message);
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col">
      <section
        className="w-full h-[70vh] flex justify-center items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${eventBG})` }}
      >
        <div className="max-w-[150vh] w-full px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <h2 className="text-[10vh] sm:text-[8vh] md:text-[6vh] lg:text-[8vh] font-tungsten text-[#3a1078] leading-none uppercase">
              {orgDetails.name}
            </h2>
            <p className="text-black text-base md:text-lg">
              {orgDetails.description}
            </p>
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
      <section className="w-full h-auto flex flex-col items-center bg-[#f7f7f8] py-16">
        <div className="max-w-[150vh] w-full px-6 md:px-10">
          <h2 className="text-[19vw] sm:text-[8vw] md:text-[6vw] lg:text-[5vw] font-tungsten text-[#3a1078] leading-none uppercase text-center md:text-left mb-8">
            Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {orgDetails.events &&
              orgDetails.events.map((event, index) => (
                <div key={index} className="flex flex-col items-center" onClick={() => handleEventClick(event)}>
                  <img
                    className="w-[30vh] h-auto object-cover rounded-lg" // 4rem is equivalent to 16px
                    src={event.images || orgimg}
                    alt="Event Image"
                  />
                  <h3 className="text-lg font-semibold text-[#3a1078] mt-4">{event.name}</h3>
                </div>
              ))}
          </div>
        </div>
      </section>
      <section className="w-full h-auto flex flex-col items-center bg-[#f7f7f8] py-16">
        <div className="max-w-[150vh] w-full px-6 md:px-10">
          <h2 className="text-[19vw] sm:text-[8vw] md:text-[6vw] lg:text-[5vw] font-tungsten text-[#3a1078] leading-none uppercase text-center md:text-left mb-8">
            Officers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {orgDetails.officers &&
              orgDetails.officers.map((officer, index) => (
                <div key={index} className="flex flex-col items-center">
                  <img
                    className="w-[30vh] h-auto object-cover rounded-lg"
                    src={officer.image || orgimg}
                    alt="Officer Image"
                  />
                  <h3 className="text-lg font-semibold text-[#3a1078] mt-4">{officer.name}</h3>
                  <p className="text-lg font-semibold text-[#3a1078] mt-4">{officer.position}</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4">{selectedEvent.name}</h2>
            <p className="text-gray-700 mb-4">{selectedEvent.description}</p>
            <p className="text-gray-700 mb-4">
              {new Date(selectedEvent.dateStart).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })} to {new Date(selectedEvent.dateEnd).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })} @ {selectedEvent.location}
            </p>
            <button className="bg-[#3a1078] text-white px-4 py-2 rounded" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrgDetails;