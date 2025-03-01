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
    const fetchOrganizations = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));

        if (!userData || !userData.organizationId) {
          throw new Error("Organization id not found in user data.");
        }

        const organizationId = userData.organizationId;
        setOrgId(organizationId);

        const token = localStorage.getItem("authToken");

        const response = await fetch(
          `${apiUrl}/organization/${organizationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch organization details");
        }

        const data = await response.json();
        setOrgDetails(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
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
            <h2 className="text-[10vw] sm:text-[8vw] md:text-[6vw] lg:text-[8vw] font-tungsten text-[#3a1078] leading-none uppercase">
              {orgDetails.name}
            </h2>
            <p className="text-black text-base md:text-lg">
              {orgDetails.description}
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <img
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg object-cover rounded-full"
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
                  className="w-full h-auto object-cover rounded-lg"
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
