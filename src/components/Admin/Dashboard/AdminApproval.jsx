import React, { useEffect, useState } from 'react';
const apiUrl = import.meta.env.VITE_API_URL;

const AdminApproval = () => {
  const [orgData, setOrgData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOfficers, setSelectedOfficers] = useState(new Set());
  const [approvedOfficers, setApprovedOfficers] = useState(new Set());
  const [declinedOfficers, setDeclinedOfficers] = useState(new Set());

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch(`${apiUrl}users/organizations/officers`);
        if (!response.ok) {
          throw new Error('Failed to fetch organizations.');
        }
        const data = await response.json();
        setOrgData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleCheckboxChange = (officerId) => {
    // If the officer was already declined, do nothing.
    if (declinedOfficers.has(officerId)) return;
    setSelectedOfficers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(officerId)) {
        newSet.delete(officerId);
      } else {
        newSet.add(officerId);
      }
      return newSet;
    });
  };

  const handleApprove = async (officerId) => {
    try {
      const token = localStorage.getItem('token'); // Adjust according to your auth strategy
      const response = await fetch(
        `${apiUrl}users/organizations/officers/${officerId}/approve`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to approve officer.');
      }
      const data = await response.json();
      console.log(data.message);
      setApprovedOfficers((prev) => new Set(prev).add(officerId));
      setSelectedOfficers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(officerId);
        return newSet;
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDecline = (officerId) => {
    setDeclinedOfficers((prev) => new Set(prev).add(officerId));
    // Optionally remove from selected set if declined.
    setSelectedOfficers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(officerId);
      return newSet;
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', fontSize: '20px', color: '#9C4DFF' }}>Loading organizations and officers...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', fontSize: '20px', color: '#F44336' }}>Error: {error}</div>;
  }

  return (
    <div
      style={{
        backgroundColor: '#F3E5F5', // Light violet background
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '90%',
        margin: '40px auto',
        fontFamily: '"Poppins", sans-serif',
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          color: '#9C4DFF',
          fontSize: '2.5rem',
          marginBottom: '30px',
          letterSpacing: '1px',
        }}
      >
        Officer Approval Dashboard
      </h1>
      {orgData.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#9C4DFF', fontSize: '1.2rem' }}>No organizations found.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Grid layout to display cards side by side
            gap: '20px',
          }}
        >
          {orgData.map((org) => (
            <div
              key={org._id || org.name}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease-in-out',
              }}
            >
              <h2
                style={{
                  color: '#9C4DFF',
                  fontSize: '1.8rem',
                  marginBottom: '20px',
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                {org.name}
              </h2>
              {org.officers && org.officers.filter((officer) => !officer.isAdmin).length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {org.officers
                    .filter((officer) => !officer.isAdmin)
                    .map((officer) => (
                      <li
                        key={officer._id}
                        style={{
                          marginBottom: '18px',
                          padding: '12px',
                          backgroundColor: '#f9f9f9',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <div>
                          <input
                            type="checkbox"
                            id={`checkbox-${officer._id}`}
                            checked={selectedOfficers.has(officer._id)}
                            disabled={declinedOfficers.has(officer._id)}
                            onChange={() => handleCheckboxChange(officer._id)}
                            style={{
                              marginRight: '12px',
                              cursor: declinedOfficers.has(officer._id) ? 'not-allowed' : 'pointer',
                            }}
                          />
                          <label
                            htmlFor={`checkbox-${officer._id}`}
                            style={{
                              color: '#333',
                              fontSize: '1rem',
                              fontWeight: '500',
                              textTransform: 'capitalize',
                            }}
                          >
                            {officer.name} {officer.surname} ({officer.email})
                          </label>
                        </div>
                        {/* Show buttons when the checkbox is checked and not already approved or declined */}
                        {selectedOfficers.has(officer._id) &&
                          !approvedOfficers.has(officer._id) &&
                          !declinedOfficers.has(officer._id) && (
                            <div>
                              <button
                                onClick={() => handleApprove(officer._id)}
                                style={{
                                  backgroundColor: '#7C4DFF',
                                  color: '#fff',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  marginRight: '12px',
                                  transition: 'background-color 0.3s ease',
                                }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDecline(officer._id)}
                                style={{
                                  backgroundColor: '#FF4081',
                                  color: '#fff',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.3s ease',
                                }}
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        {approvedOfficers.has(officer._id) && (
                          <p style={{ color: '#7C4DFF', marginTop: '8px', fontStyle: 'italic' }}>
                            Officer approved.
                          </p>
                        )}
                        {declinedOfficers.has(officer._id) && (
                          <p style={{ color: '#FF4081', marginTop: '8px', fontStyle: 'italic' }}>
                            Officer declined.
                          </p>
                        )}
                      </li>
                    ))}
                </ul>
              ) : (
                <p style={{ textAlign: 'center', color: '#9C4DFF', fontSize: '1.2rem' }}>No officers to approve.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApproval;
