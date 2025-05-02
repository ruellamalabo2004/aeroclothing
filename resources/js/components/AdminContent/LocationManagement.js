import React, { useEffect, useState } from 'react';
import { Edit2, Archive, RotateCcw } from 'lucide-react';
import axios from 'axios';

const LocationManagement = ({ token, openModal, handleModalSubmit, handleArchive, handleRestore }) => {
  const [countries, setCountries] = useState([]);
  const [countryFilter, setCountryFilter] = useState('all');
  const [countryPage, setCountryPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const itemsPerPage = 5;

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await axios.get('/api/countries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mappedCountries = res.data
        .map(country => ({
          ...country,
          status: country.archived_at ? 'archived' : 'active',
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setCountries(mappedCountries);
      setCountryPage(1);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      setSuccessMessage('Failed to load countries.');
    }
  };

  const toggleCountryFilter = () => {
    setCountryFilter(prev => {
      if (prev === 'all') return 'active';
      if (prev === 'active') return 'archived';
      return 'all';
    });
    setCountryPage(1);
  };

  const filteredCountries = countries.filter(country => {
    if (countryFilter === 'all') return true;
    return country.status === countryFilter;
  });

  const totalCountryPages = Math.ceil(filteredCountries.length / itemsPerPage);
  const paginatedCountries = filteredCountries.slice(
    (countryPage - 1) * itemsPerPage,
    countryPage * itemsPerPage
  );

  const goToPreviousCountryPage = () => {
    if (countryPage > 1) {
      setCountryPage(prev => prev - 1);
    }
  };

  const goToNextCountryPage = () => {
    if (countryPage < totalCountryPages) {
      setCountryPage(prev => prev + 1);
    }
  };

  return (
    <>
      {successMessage && (
        <div className={`settings__message ${successMessage.includes('Failed') ? 'settings__error' : 'settings__success'}`}>
          {successMessage}
        </div>
      )}
      <div className="settings__section settings__section--boxed">
        <div className="settings__section-header">
          <h3>Country Management</h3>
          <div className="settings__header-actions">
            <button onClick={toggleCountryFilter} className="settings__filter-button">
              Showing: {countryFilter === 'all' ? 'All' : countryFilter === 'active' ? 'Active' : 'Archived'}
            </button>
            <button onClick={() => openModal('addCountry')} className="settings__add-button">
              + Add Country
            </button>
          </div>
        </div>
        <div className="settings__table-container">
          <table className="settings__table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Actions</th>
                <th>Name</th>
                <th style={{ width: '120px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCountries.length > 0 ? (
                paginatedCountries.map((country) => (
                  <tr key={country.id}>
                    <td>
                      <Edit2
                        className="settings__action-icon"
                        onClick={() => openModal('editCountry', country.id, country.name)}
                      />
                      {country.status === 'active' ? (
                        <Archive
                          className="settings__action-icon"
                          onClick={() => handleArchive('country', country.id, fetchCountries)}
                        />
                      ) : (
                        <RotateCcw
                          className="settings__action-icon"
                          onClick={() => handleRestore('country', country.id, fetchCountries)}
                        />
                      )}
                    </td>
                    <td>{country.name}</td>
                    <td>
                      <span className={`settings__status settings__status--${country.status}`}>
                        {country.status === 'active' ? 'Active' : 'Archived'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3">No countries available</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="settings__pagination">
          <button
            className="settings__pagination-button"
            onClick={goToPreviousCountryPage}
            disabled={countryPage === 1}
          >
            Previous
          </button>
          <span className="settings__pagination-info">
            Page {countryPage} of {totalCountryPages} | Showing {Math.min((countryPage - 1) * itemsPerPage + 1, filteredCountries.length)}-{Math.min(countryPage * itemsPerPage, filteredCountries.length)} of {filteredCountries.length}
          </span>
          <button
            className="settings__pagination-button"
            onClick={goToNextCountryPage}
            disabled={countryPage === totalCountryPages}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default LocationManagement;