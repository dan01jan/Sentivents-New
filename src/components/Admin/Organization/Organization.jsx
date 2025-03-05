import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import OrgCreate from "./OrgCreate";
import OrgUpdate from "./OrgUpdate";
import { IoMdSearch } from "react-icons/io";
const apiUrl = import.meta.env.VITE_API_URL;
function Organization() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
          throw new Error(
            "There are no organizations available at the moment."
          );
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
            key={org.id}
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

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => openUpdateModal(org)}
                  className="bg-indigo-600 text-white text-sm font-semibold uppercase px-6 py-2 rounded-full transition hover:bg-indigo-700"
                >
                  Update
                </button>
                <a
                  href="#"
                  className="bg-red-600 text-white text-sm font-semibold uppercase px-6 py-2 rounded-full transition hover:bg-indigo-700"
                >
                  Delete
                </a>
              </div>
            </div>
          </div>
        ))
      )}
      <button
        className="fixed bottom-10 right-10 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition"
        onClick={openModal}
      >
        <FaPlus size={24} />
      </button>
      <OrgCreate isOpen={isModalOpen} onClose={closeModal} />
      {selectedOrg && (
        <OrgUpdate
          isOpen={isUpdateModalOpen}
          onClose={closeUpdateModal}
          organization={selectedOrg}
        />
      )}
    </div>
  );
}

export default Organization;
