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
  const [archivedOrgs, setArchivedOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isOfficerUpdateModalOpen, setIsOfficerUpdateModalOpen] = useState(false);
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [officers, setOfficers] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchOrganizations = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${apiUrl}organizations/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("There are no organizations available at the moment.");
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
    setConfirmDeleteId(id);
  };

  const confirmArchive = async () => {
    const token = localStorage.getItem("authToken");
    if (!confirmDeleteId || !token) return;

    try {
      const response = await fetch(`${apiUrl}organizations/archive/${confirmDeleteId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to archive organization");
      }

      setOrganizations((prev) => prev.filter((org) => org._id !== confirmDeleteId));
      showToastMessage("Organization archived successfully!");
    } catch (error) {
      console.error("Error archiving organization:", error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const fetchArchivedOrgs = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const response = await fetch(`${apiUrl}organizations/archived`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch archived organizations");
      const data = await response.json();
      setArchivedOrgs(data);
      setIsArchiveModalOpen(true);
    } catch (err) {
      console.error("Failed to load archived orgs:", err);
    }
  };

  const handleUnarchive = async (id) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(`${apiUrl}organizations/unarchive/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to unarchive");

      setArchivedOrgs((prev) => prev.filter((org) => org._id !== id));
      showToastMessage("Organization unarchived!");
    } catch (error) {
      console.error("Error unarchiving:", error);
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
      if (!response.ok) throw new Error("Failed to fetch officers for this organization.");
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
      {/* Top Bar: Search (left) and View Archived (right) */}
      <div className="flex flex-row items-center justify-between mb-6 w-full">
        <div className="relative w-full max-w-xs">
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
        <button
          onClick={fetchArchivedOrgs}
          className="ml-4 bg-[#3a1078] text-white font-semibold px-4 py-2 rounded-full hover:bg-[#3795bd] transition"
        >
          Archived Organizations
        </button>
      </div>

      {isArchiveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 sm:p-8 rounded-2xl w-full max-w-4xl shadow-xl relative max-h-[80vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setIsArchiveModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl focus:outline-none"
            >
              &times;
            </button>

            {/* Modal Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#3a1078] mb-6">
              Archived Organizations
            </h2>

            {/* Archived Organization List */}
            <div className="overflow-y-auto flex-1 max-h-[70vh] pr-2">
              {archivedOrgs.length > 0 ? (
                <div className="space-y-4">
                  {archivedOrgs.map((org) => (
                    <div
                      key={org._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 border border-gray-200 p-4 sm:p-5 rounded-xl shadow-sm transition hover:shadow-md"
                    >
                      <div className="mb-3 sm:mb-0">
                        <h3 className="text-lg font-semibold text-[#3a1078]">{org.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{org.description}</p>
                      </div>
                      <button
                        onClick={() => handleUnarchive(org._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition"
                      >
                        Unarchive
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 italic">No archived organizations found.</p>
              )}
            </div>
          </div>
        </div>
      )}



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
                  Archive
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
            <h2 className="text-2xl font-bold text-red-600 mb-4">Confirm Archive</h2>
            <p className="mb-6 text-gray-700">Are you sure you want to archive this organization?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmArchive}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                No
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
