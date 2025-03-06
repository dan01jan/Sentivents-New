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
    return <div>Loading organizations and officers...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div
      style={{
        backgroundColor: '#FFF0F5',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '800px',
        margin: '40px auto',
        fontFamily: '"Comic Sans MS", cursive, sans-serif'
      }}
    >
      <h1 style={{ textAlign: 'center', color: '#d81b60' }}>Organizations and Officers</h1>
      {orgData.length === 0 ? (
        <p>No organizations found.</p>
      ) : (
        orgData.map((org) => (
          <div
            key={org._id || org.name}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}
          >
            <h2 style={{ color: '#ad1457' }}>{org.name}</h2>
            {org.officers && org.officers.filter(officer => !officer.isAdmin).length > 0 ? (
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {org.officers.filter(officer => !officer.isAdmin).map((officer) => (
                  <li key={officer._id} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        id={`checkbox-${officer._id}`}
                        checked={selectedOfficers.has(officer._id)}
                        disabled={declinedOfficers.has(officer._id)}
                        onChange={() => handleCheckboxChange(officer._id)}
                      />
                      <label htmlFor={`checkbox-${officer._id}`} style={{ marginLeft: '8px' }}>
                        {officer.name} {officer.surname} ({officer.email})
                      </label>
                    </div>
                    {/* Show buttons when the checkbox is checked and not already approved or declined */}
                    {selectedOfficers.has(officer._id) &&
                      !approvedOfficers.has(officer._id) &&
                      !declinedOfficers.has(officer._id) && (
                        <div style={{ marginTop: '8px' }}>
                          <button onClick={() => handleApprove(officer._id)} style={{ marginRight: '8px' }}>
                            Approve
                          </button>
                          <button onClick={() => handleDecline(officer._id)}>Decline</button>
                        </div>
                      )}
                    {approvedOfficers.has(officer._id) && (
                      <p style={{ color: 'green', marginTop: '8px' }}>Officer approved.</p>
                    )}
                    {declinedOfficers.has(officer._id) && (
                      <p style={{ color: 'red', marginTop: '8px' }}>Officer declined.</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No officers to approve.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AdminApproval;
