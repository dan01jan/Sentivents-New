import React, { useEffect, useState } from "react";
import orgimg from "../../assets/website/org/Association of Civil Engineering Students of TUP Taguig Campus(ACES).jpg";
import eventBG from "../../assets/website/eventBG.png";

const apiUrl = import.meta.env.VITE_API_URL;

function OrgDetails() {
  const [organizationId, setOrgId] = useState(null);
  const [orgDetails, setOrgDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const organizationId = localStorage.getItem("selectedOrgId");
    
        if (!organizationId) {
          throw new Error("Organization ID not found in local storage.");
        }
    
        console.log("Fetching organization with ID:", organizationId);
        
        setOrgId(organizationId);
    
        // Get token from local storage or cookie
        const token = localStorage.getItem("authToken");  // Replace with your actual method for getting the token
    
        const response = await fetch(`${apiUrl}organizations/${organizationId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`, // Include the token here
            "Content-Type": "application/json"
          }
        });
    
        console.log("Response status:", response.status);
    
        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.message || "Failed to fetch organization details");
        }
    
        const data = await response.json();
        console.log("Fetched organization data:", data);
    
        setOrgDetails(data);
      } catch (error) {
        console.error("Error fetching organization:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    

    fetchOrganization();
  }, []);
  
  

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {orgDetails.events &&
              orgDetails.events.map((event, index) => (
                <img
                  key={index}
                  className="w-full h-auto object-cover rounded-lg"
                  src={event.image || orgimg}
                  alt="Event Image"
                />
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
                <img
                  key={index}
                  className="w-[30vh] h-auto object-cover rounded-lg"
                  src={officer.image || orgimg}
                  alt="Officer Image"
                />
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default OrgDetails;
