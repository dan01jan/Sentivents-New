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
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // null or org id

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

  const askDelete = (id) => {
    setConfirmDeleteId(id); // Opens confirm modal
  };
  
  const confirmDelete = async () => {
    const token = localStorage.getItem("authToken");
    if (!confirmDeleteId || !token) return;
  
    try {
      const response = await fetch(`${apiUrl}organizations/${confirmDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to delete organization");
      }
  
      setOrganizations((prev) =>
        prev.filter((org) => org.id !== confirmDeleteId && org._id !== confirmDeleteId)
      );
      showToastMessage("Organization deleted successfully!");
    } catch (error) {
      console.error("Error deleting organization:", error);
    } finally {
      setConfirmDeleteId(null); // Close confirm modal
    }
  };
  

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
  const closeOfficerUpdateModal = () => {
    setIsOfficerUpdateModalOpen(false);
    setSelectedOrg(null);
  };

  const openOfficerModal = async (org) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(`${apiUrl}organizations/eligible-officers/${org._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch officers for this organization.");
      }
      const data = await response.json();
      setOfficers(data);
      setSelectedOrg(org);
      setIsOfficerModalOpen(true);
    } catch (error) {
      console.error("Error fetching organization officers:", error);
    }
  };

  const closeOfficerModal = () => {
    setIsOfficerModalOpen(false);
    setSelectedOrg(null);
    setOfficers([]);
  };

  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col px-10">
      {/* Search Bar */}
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

      {/* Organizations List */}
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
                <h3 className="text-2xl font-bold text-[#3a1078] mb-3">{org.name}</h3>
                <p className="text-gray-700 text-base leading-relaxed line-clamp-3">
                  {org.description}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => openOfficerModal(org)}
                  className="bg-[#3795bd] text-white text-sm font-semibold uppercase px-6 py-2 rounded-full hover:bg-[#3a1078] transition"
                >
                  Show Officers
                </button>
                <button
                  onClick={() => openOfficerUpdateModal(org)}
                  className="bg-yellow-600 text-white text-sm font-semibold uppercase px-6 py-2 rounded-full hover:bg-yellow-700 transition"
                >
                  Update Officer
                </button>
                <button
                  onClick={() => openUpdateModal(org)}
                  className="bg-indigo-600 text-white text-sm font-semibold uppercase px-6 py-2 rounded-full hover:bg-indigo-700 transition"
                >
                  Update
                </button>
                <button
                  onClick={() => askDelete(org.id || org._id)}
                  className="bg-red-600 text-white text-sm font-semibold uppercase px-6 py-2 rounded-full hover:bg-red-700 transition"
                >
                  Delete
                </button>

              </div>
            </div>
          </div>
        ))
      )}

      {/* Floating Add Button */}
      <button
        className="fixed bottom-10 right-10 bg-[#3a1078] text-white p-4 rounded-full shadow-lg hover:bg-[#3a1078c5] transition"
        onClick={openModal}
      >
        <FaPlus size={24} />
      </button>

      {/* Modals */}
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
            onClose={closeOfficerUpdateModal}
            organization={selectedOrg}
          />
        </>
      )}

{isOfficerModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg w-full max-w-4xl relative max-h-[80vh] overflow-y-auto">
      <button
        onClick={closeOfficerModal}
        className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl"
      >
        &times;
      </button>
      <h2 className="text-[5vh] font-bold mb-4 font-semibold text-[#3a1078] text-center">
        Officers
      </h2>
      {officers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {officers.map((officer) => (
            <div key={officer._id} className="mb-4 p-4 border rounded-lg text-center">
              <img
                src={
                  officer.image ||
                  "https://res.cloudinary.com/do2utxjmc/image/upload/v1741749795/3918329-200_bpfm11.png"
                }
                alt="Officer"
                className="w-24 h-24 rounded-full mb-2 mx-auto"
              />
              <p className="text-2xl text-[#3a1078] font-semibold">
                {officer.name} {officer.surname}
              </p>
              <p className="text-[#3a1078]">{officer.position}</p>
              {/* <p className="text-[#3a1078]">{officer.email}</p> */}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-[#3a1078]">No officers found.</p>
      )}
    </div>
  </div>
)}
    {/* 🟣 Confirm Delete Modal */}
    {confirmDeleteId && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Confirm Delete</h2>
          <p className="mb-6 text-gray-700">Are you sure you want to delete this organization?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={confirmDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* 🟢 Toast */}
    {showToast && (
      <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg transition-opacity duration-300 z-50">
        {toastMessage}
      </div>
    )}

    </div>
  );
}

export default Organization;
