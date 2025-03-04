import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa"; // Import the FaEye icon
const apiUrl = import.meta.env.VITE_API_URL;

function AdminDashboard() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleViewClick = (org) => {
    setSelectedOrg(org);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrg(null);
  };

  return (
    <div className="flex flex-col px-10">
      <div className="h-[30vh] w-full bg-[#3a1078] flex justify-center items-center shadow-lg px-10 gap-8">
        <div className="w-1/4 h-[20vh] bg-[#f7f7f8] flex items-center justify-center shadow-md">
          <p className="text-[#3a1078] font-bold text-xl">Box 1</p>
        </div>
        <div className="w-1/4 h-[20vh] bg-[#f7f7f8] flex items-center justify-center shadow-md">
          <p className="text-[#3a1078] font-bold text-xl">Box 2</p>
        </div>
        <div className="w-1/4 h-[20vh] bg-[#f7f7f8] flex items-center justify-center shadow-md">
          <p className="text-[#3a1078] font-bold text-xl">Box 3</p>
        </div>
        <div className="w-1/4 h-[20vh] bg-[#f7f7f8] flex items-center justify-center shadow-md">
          <p className="text-[#3a1078] font-bold text-xl">Box 4</p>
        </div>
      </div>

      <section className="w-full bg-[#3a1078] shadow-lg px-10 mt-11 h-[40vh] overflow-y-auto rounded-lg">
        {loading ? (
          <p className="text-white text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div className="border-b-4 border-[#3a1078]">
            <table className="w-full text-left text-xl text-[#3a1078] font-bold">
              <thead className="sticky top-0 bg-[#3a1078] text-white">
                <tr>
                  <th className="w-[15%] p-5">Organization</th>
                  <th className="w-[80%] p-5">Details</th>
                  <th className="w-[10%] p-5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr
                    key={org.id}
                    className="bg-[#f7f7f8] rounded-lg shadow-md mb-2"
                  >
                    <td className="p-5">
                      <img
                        src={org.image}
                        alt={org.name}
                        className="w-16 h-16 rounded-full"
                      />
                    </td>
                    <td className="p-5">
                      <h3 className="text-[#3a1078] font-bold text-lg">
                        {org.name}
                      </h3>
                      <p className="text-gray-600 text-sm">{org.description}</p>
                    </td>
                    <td className="p-5">
                      <button
                        className="bg-[#3a1078] text-white px-4 py-2 rounded-lg hover:bg-[#2a0d5e] transition"
                        onClick={() => handleViewClick(org)}
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 bg-[#3a1078] h-10">
                <tr>
                  <td colSpan="3" className="p-0"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {isModalOpen && selectedOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-5 rounded-lg shadow-lg w-1/2">
            <h2 className="text-2xl font-bold mb-4">{selectedOrg.name}</h2>
            <img
              src={selectedOrg.image}
              alt={selectedOrg.name}
              className="w-32 h-32 rounded-full mb-4"
            />
            <p className="text-gray-600 mb-4">{selectedOrg.description}</p>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;