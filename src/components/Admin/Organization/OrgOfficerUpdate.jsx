import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const apiUrl = import.meta.env.VITE_API_URL;

const OrgOfficerUpdate = ({ isOpen, onClose, organization }) => {
  const [officers, setOfficers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (organization && organization._id) {
      fetch(`${apiUrl}organizations/eligible-officers/${organization._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            setOfficers(data);
          }
        })
        .catch((error) => {
          console.error('Error fetching eligible officers:', error);
          toast.error('Failed to fetch eligible officers');
        });
    }
  }, [organization]);

  const handleOfficerChange = (index, field, value) => {
    const newOfficers = [...officers];
    newOfficers[index] = {
      ...newOfficers[index],
      [field]: value,
    };
    setOfficers(newOfficers);
  };

  const handleAddOfficer = () => {
    setOfficers([...officers, { name: '', image: '', position: '' }]);
  };

  const handleRemoveOfficer = async (index) => {
    const officerToRemove = officers[index];
    const newOfficers = officers.filter((_, i) => i !== index);
    setOfficers(newOfficers);

    if (officerToRemove._id) {
      const token = localStorage.getItem('authToken');
      try {
        const response = await fetch(`${apiUrl}organizations/${organization._id}/officers`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ officers: newOfficers }),
        });
        if (!response.ok) {
          throw new Error('Failed to update officers after removal');
        }
        toast.success('Officer removed successfully');
      } catch (error) {
        console.error('Error updating officers after removal:', error);
        toast.error('Failed to remove officer');
      }
    } else {
      toast.info('Officer removed locally');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');

    const formData = new FormData();
    const officersForSubmission = officers.map((officer) => {
      if (officer.image instanceof File) {
        return { ...officer, image: '' };
      }
      return officer;
    });
    formData.append('officers', JSON.stringify(officersForSubmission));

    officers.forEach((officer, index) => {
      if (officer.image instanceof File) {
        formData.append(`image_${index}`, officer.image);
      }
    });

    try {
      const response = await fetch(`${apiUrl}organizations/${organization._id}/officers`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to update officers');
      }
      toast.success('Officers updated successfully');
      setTimeout(() => onClose(), 3000);
    } catch (error) {
      console.error('Error updating officers:', error);
      toast.error('Failed to update officers');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <ToastContainer />
      <div className="bg-white p-6 rounded-md w-11/12 md:w-1/2 max-h-screen overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Update Officers</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 text-2xl">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {officers.map((officer, index) => (
            <div key={index} className="mb-6 border p-4 rounded">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Officer {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => handleRemoveOfficer(index)}
                  className="text-red-600"
                >
                  Remove
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  value={officer.name}
                  onChange={(e) => handleOfficerChange(index, 'name', e.target.value)}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Image</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    handleOfficerChange(index, 'image', file);
                  }}
                  className="w-full border p-2 rounded"
                  accept="image/*"
                />
                {officer.image && !(officer.image instanceof File) && (
                  <img src={officer.image} alt={`Officer ${index + 1}`} className="mt-2 h-20" />
                )}
                {officer.image && officer.image instanceof File && (
                  <p className="mt-2 text-sm text-gray-600">{officer.image.name}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Position</label>
                <input
                  type="text"
                  value={officer.position}
                  onChange={(e) => handleOfficerChange(index, 'position', e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          ))}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleAddOfficer}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Add Officer
            </button>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
              Update Officers
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrgOfficerUpdate;