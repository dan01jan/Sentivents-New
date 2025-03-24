import React from "react";
import { useNavigate } from "react-router-dom";

const OrgLoginModal = ({ user, closeModal }) => {
  const navigate = useNavigate();

  const officerMembership = user.organizations.find(
    (membership) => membership.role.toLowerCase() === "officer"
  );

  const handleOfficer = () => {
    if (
      officerMembership &&
      officerMembership.organization &&
      officerMembership.organization.name &&
      officerMembership.organization._id
    ) {
      localStorage.setItem("officerOrgName", officerMembership.organization.name);
      localStorage.setItem("officerOrgId", officerMembership.organization._id);
      if (officerMembership.organization.image) {
        localStorage.setItem("officerOrgImage", officerMembership.organization.image);
      }
      localStorage.setItem("officerDepartment", officerMembership.department);
      navigate("/dashboard");
      closeModal();
    } else {
      alert("Oops! We couldn't find your officer membership. 🧐");
    }
  };

  const handleUser = () => {
    navigate("/");
    closeModal();
  };

  return (
    <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="modal bg-white p-6 rounded-2xl shadow-lg max-w-sm mx-auto text-center">
        <h2 className="text-2xl font-bold mb-3 text-gray-800">🎉 Welcome! 🎉</h2>
        <p className="mb-5 text-gray-600">Where would you like to go today? 🌟</p>
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleUser}
            className="px-6 py-3 rounded-lg bg-blue-400 hover:bg-blue-500 text-white font-semibold shadow-md transition-all"
          >
            😊 User Side
          </button>
          <button
            onClick={handleOfficer}
            className="px-6 py-3 rounded-lg bg-green-400 hover:bg-green-500 text-white font-semibold shadow-md transition-all"
          >
            🚀 Officer Side
          </button>
        </div>
        <button
          onClick={closeModal}
          className="mt-4 text-gray-500 text-sm hover:text-gray-700 transition-all"
        >
          ❌ Close
        </button>
      </div>
    </div>
  );
};

export default OrgLoginModal;
