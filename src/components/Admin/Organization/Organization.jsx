import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import OrgCreate from "./OrgCreate";
import OrgUpdate from "./OrgUpdate";
import OrgOfficerUpdate from "./OrgOfficerUpdate";
import { IoMdSearch } from "react-icons/io";
import { Link } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

function Organization() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isOfficerUpdateModalOpen, setIsOfficerUpdateModalOpen] = useState(false);
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [officers, setOfficers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchOrganizations = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${apiUrl}organizations/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("There are no organizations available at the moment.");
        }
        const data = await response.json();
        console.log("Fetched organizations data:", data);
        setOrganizations(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizations();
    const intervalId = setInterval(fetchOrganizations, 2000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const response = await fetch(`${apiUrl}users/organizations/officers`);
        if (!response.ok) {
          throw new Error("Failed to fetch organizations.");
        }
        const data = await response.json();
        setOfficers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficers();
    const intervalId = setInterval(fetchOfficers, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleDelete = async (id) => {
    if (!id) {
      console.error("Error: Organization ID is undefined");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!window.confirm("Are you sure you want to delete this organization?")) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}organizations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to delete organization");
      }

      // Remove the deleted organization from the state
      setOrganizations((prevOrgs) => prevOrgs.filter((org) => org.id !== id));
    } catch (error) {
      console.error("Error deleting organization:", error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openUpdateModal = (org) => {
    setSelectedOrg(org);
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedOrg(null);
  };

  const openOfficerUpdateModal = (org) => {
    setSelectedOrg(org);
    setIsOfficerUpdateModalOpen(true);
  };

  const openOfficerModal = (org) => {
    setSelectedOrg(org);
    setIsOfficerModalOpen(true);
  };

  const closeOfficerModal = () => {
    setIsOfficerModalOpen(false);
    setSelectedOrg(null);
  };

  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col px-10 ">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full md:w-1/4">
          <input
            type="text"
            placeholder="Search for organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2">
            <IoMdSearch />
          </div>
        </div>
      </div>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        filteredOrganizations.map((org) => (
          <div
            key={org.id || org._id}
            className="flex flex-col md:flex-row bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition hover:shadow-2xl mb-6"
          >
            <div className="md:w-[30vh]">
              <img
                alt={org.name}
                src={org.image}
                className="w-full h-56 md:h-full object-cover"
              />
            </div>

            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {org.name}
                </h3>
                <p className="text-gray-700 text-base leading-relaxed line-clamp-3">
                  {org.description}
                </p>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => openOfficerModal(org)}
                  className="bg-[#3795bd] text-white text-sm font-semibold uppercase px-6 py-2 rounded-full transition hover:bg-[#3a1078]"
                >
                  Show Officers
                </button>
                <button
                  onClick={() => openOfficerUpdateModal(org)}
                  className="bg-yellow-600 text-white text-sm font-semibold uppercase px-6 py-2 rounded-full transition hover:bg-yellow-700"
                >
                  Update Officer
                </button>
                <button
                  onClick={() => openUpdateModal(org)}
                  className="bg-indigo-600 text-white text-sm font-semibold uppercase px-6 py-2 rounded-full transition hover:bg-indigo-700"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(org.id || org._id)}
                  className="bg-red-600 text-white text-sm font-semibold uppercase px-6 py-2 rounded-full transition hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
      <button
        className="fixed bottom-10 right-10 bg-[#3a1078] text-white p-4 rounded-full shadow-lg hover:bg-[#3a1078c5] transition"
        onClick={openModal}
      >
        <FaPlus size={24} />
      </button>

      <OrgCreate isOpen={isModalOpen} onClose={closeModal} />
      {selectedOrg && (
        <>
          <OrgUpdate
            isOpen={isUpdateModalOpen}
            onClose={closeUpdateModal}
            organization={selectedOrg}
          />
          <OrgOfficerUpdate
            isOpen={isOfficerUpdateModalOpen}
            onClose={() => {
              setIsOfficerUpdateModalOpen(false);
              setSelectedOrg(null);
            }}
            organization={selectedOrg}
          />
          {isOfficerModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg w-96 relative">
                <button
                  onClick={closeOfficerModal}
                  className="absolute top-2 right-2 text-gray-600 hover:text-black"
                >
                  &times;
                </button>
                <h2 className="text-[5vh] font-bold mb-4 font-tungsten text-[#3a1078]">
                  Officers
                </h2>
                {selectedOrg.officers.length > 0 ? (
                  selectedOrg.officers.map((officer) => (
                    <div key={officer._id} className="mb-4 p-4 border rounded-lg">
                      <img
                        src={
                          officer.image ||
                          "https://res.cloudinary.com/do2utxjmc/image/upload/v1741749795/3918329-200_bpfm11.png"
                        }
                        alt="Officer"
                        className="w-24 h-24 rounded-full mb-2 items-center justify-center mx-auto"
                      />
                      <p className="text-2xl text-center text-[#3a1078] font-semibold">
                        {officer.name} {officer.surname}
                      </p>
                      <p className="text-center text-[#3a1078]">{officer.email}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[#3a1078]">No officers found.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Organization;