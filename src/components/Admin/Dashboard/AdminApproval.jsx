import React, { useEffect, useState } from "react";
const apiUrl = import.meta.env.VITE_API_URL; // e.g., "http://localhost:4000/api/v1/"

const AdminApproval = () => {
  const [orgData, setOrgData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOfficers, setSelectedOfficers] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch(`${apiUrl}users/organizations/officers`);
        if (!response.ok) {
          throw new Error("Failed to fetch organizations.");
        }
        const data = await response.json();
        // Directly set the data returned from the aggregation.
        setOrgData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

const handleApprove = async (officerId) => {
  try {
    const token = localStorage.getItem("token");
    const organizationId = localStorage.getItem("selectedOrgId");

    const response = await fetch(
      `${apiUrl}users/organizations/officers/${officerId}/approve`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ organizationId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to approve officer.");
    }

    const data = await response.json();
    console.log("Officer approved:", data);

    setOrgData((prevData) =>
      prevData.map((org) => {
        if (org._id === selectedOrgId) {
          return {
            ...org,
            officers: org.officers.filter((officer) => officer._id !== officerId),
          };
        }
        return org;
      })
    );

    setSelectedOfficers((prev) =>
      prev.filter((officer) => officer._id !== officerId)
    );
  } catch (error) {
    console.error("Error in approving officer:", error);
    alert(error.message);
  }
};


  const handleDecline = async (officerId) => {
    try {
      const token = localStorage.getItem("token");
      // Use the decline endpoint for the officer.
      const response = await fetch(
        `${apiUrl}users/organizations/officers/${officerId}/decline`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to decline officer.");
      const data = await response.json();
      alert(data.message); // Show success message
      setOrgData((prevData) =>
        prevData.map((org) => {
          if (org._id === selectedOrgId) {
            return {
              ...org,
              officers: org.officers.filter(
                (officer) => officer._id !== officerId
              ),
            };
          }
          return org;
        })
      );
      setSelectedOfficers((prev) =>
        prev.filter((officer) => officer._id !== officerId)
      );
    } catch (error) {
      console.error(error);
      alert("Failed to decline officer.");
    }
  };

    const openModal = (orgId, officers, orgName) => {
      console.log("Clicked organization:", orgId, orgName);
      setSelectedOrgId(orgId);
      setSelectedOfficers(officers);

      // Save to localStorage
      localStorage.setItem("selectedOrgId", orgId);
      localStorage.setItem("selectedOrgName", orgName);
    };


  if (loading)
    return (
      <div className="text-center text-xl text-purple-500">
        Loading organizations and officers...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-xl text-red-500">Error: {error}</div>
    );

  return (
    <div className="p-4 max-w-full mx-auto">
      <h1 className="text-[6vh] font-bold mb-4 font-semibold text-[#3a1078]">
        Officer Approval Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {orgData.map((org) => {
          const pendingApprovals = org.officers;
          return (
            <div
              key={org._id || org.name}
              className="relative bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition w-full max-w-xs h-40 flex justify-center items-center cursor-pointer"
             onClick={() => openModal(org._id, pendingApprovals, org.name)}
            >
              <h2 className="text-center text-2xl text-[#4e31aa] font-semibold">
                {org.name}
              </h2>
              {pendingApprovals.length > 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {pendingApprovals.length}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selectedOfficers.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <button
              onClick={() => setSelectedOfficers([])}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              &times;
            </button>
            <h2 className="text-[5vh] font-bold mb-4 font-tungsten text-[#3a1078]">
              Officer Approvals
            </h2>
            {selectedOfficers.map((officer) => (
              <div key={officer._id} className="mb-4 p-4 border rounded-lg">
                <img
                  src={
                    officer.image ||
                    "https://res.cloudinary.com/do2utxjmc/image/upload/v1741749795/3918329-200_bpfm11.png"
                  }
                  alt="Officer"
                  className="w-24 h-24 rounded-full mb-2 mx-auto"
                />
                <p className="text-2xl text-center text-[#3a1078] font-semibold">
                  {officer.name} {officer.surname}
                </p>
                <p className="text-center text-[#3a1078]">{officer.email}</p>
                <div className="flex space-x-4 mt-2 justify-center">
                  <button
                    onClick={() => handleApprove(officer._id)}
                    className="bg-[#3a1078] text-white px-4 py-2 rounded-lg hover:bg-[#3a1078c5]"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecline(officer._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-400"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApproval;
