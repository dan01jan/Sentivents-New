import React from "react";
import { useNavigate } from "react-router-dom";

const OrgLoginModal = ({ user, closeModal }) => {
  const navigate = useNavigate();

  // Find the officer membership from the user's organizations
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
      // Store the officer organization name, id, and department in localStorage
      localStorage.setItem(
        "officerOrgName",
        officerMembership.organization.name
      );
      localStorage.setItem(
        "officerOrgId",
        officerMembership.organization._id
      );
      localStorage.setItem(
        "officerDepartment",
        officerMembership.department
      );
      navigate("/dashboard");
      closeModal();
    } else {
      alert("Officer membership not found.");
    }
  };

  const handleUser = () => {
    navigate("/");
    closeModal();
  };

  return (
    <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="modal bg-white p-8 rounded shadow-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Select Access</h2>
        <p className="mb-6">Choose the side you want to access:</p>
        <div className="flex space-x-4">
          <button
            onClick={handleUser}
            className="px-6 py-2 rounded bg-blue-500 text-white"
          >
            User Side
          </button>
          <button
            onClick={handleOfficer}
            className="px-6 py-2 rounded bg-green-500 text-white"
          >
            Officer Side{" "}
            {officerMembership && officerMembership.organization && (
              <span>({officerMembership.organization.name})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrgLoginModal;
