import React, { useEffect, useState } from 'react';
import { Edit2 } from 'lucide-react';
import axios from 'axios';

const AttributesManagement = ({ token, openModal, handleModalSubmit }) => {
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colorPage, setColorPage] = useState(1);
  const [sizePage, setSizePage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const itemsPerPage = 5;

  useEffect(() => {
    fetchColors();
    fetchSizes();
  }, []);

  const fetchColors = async () => {
    try {
      const res = await axios.get('/api/colors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mappedColors = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setColors(mappedColors);
      setColorPage(1);
    } catch (error) {
      console.error('Failed to fetch colors:', error);
      setSuccessMessage('Failed to load colors.');
    }
  };

  const fetchSizes = async () => {
    try {
      const res = await axios.get('/api/sizes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mappedSizes = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setSizes(mappedSizes);
      setSizePage(1);
    } catch (error) {
      console.error('Failed to fetch sizes:', error);
      setSuccessMessage('Failed to load sizes.');
    }
  };

  const totalColorPages = Math.ceil(colors.length / itemsPerPage);
  const paginatedColors = colors.slice(
    (colorPage - 1) * itemsPerPage,
    colorPage * itemsPerPage
  );

  const totalSizePages = Math.ceil(sizes.length / itemsPerPage);
  const paginatedSizes = sizes.slice(
    (sizePage - 1) * itemsPerPage,
    sizePage * itemsPerPage
  );

  const goToPreviousColorPage = () => {
    if (colorPage > 1) {
      setColorPage(prev => prev - 1);
    }
  };

  const goToNextColorPage = () => {
    if (colorPage < totalColorPages) {
      setColorPage(prev => prev + 1);
    }
  };

  const goToPreviousSizePage = () => {
    if (sizePage > 1) {
      setSizePage(prev => prev - 1);
    }
  };

  const goToNextSizePage = () => {
    if (sizePage < totalSizePages) {
      setSizePage(prev => prev + 1);
    }
  };

  return (
    <>
      {successMessage && (
        <div className={`settings__message ${successMessage.includes('Failed') ? 'settings__error' : 'settings__success'}`}>
          {successMessage}
        </div>
      )}

      {/* Color Management */}
      <div className="settings__section settings__section--boxed">
        <div className="settings__section-header">
          <h3>Color Management</h3>
          <div className="settings__header-actions">
            <button onClick={() => openModal('addColor')} className="settings__add-button">
              + Add Color
            </button>
          </div>
        </div>
        <div className="settings__table-container">
          <table className="settings__table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Actions</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {paginatedColors.length > 0 ? (
                paginatedColors.map((color) => (
                  <tr key={color.id}>
                    <td>
                      <Edit2
                        className="settings__action-icon"
                        onClick={() => openModal('editColor', color.id, color.color_name)}
                      />
                    </td>
                    <td>{color.color_name}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="2">No colors available</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="settings__pagination">
          <button
            className="settings__pagination-button"
            onClick={goToPreviousColorPage}
            disabled={colorPage === 1}
          >
            Previous
          </button>
          <span className="settings__pagination-info">
            Page {colorPage} of {totalColorPages} | Showing {Math.min((colorPage - 1) * itemsPerPage + 1, colors.length)}-{Math.min(colorPage * itemsPerPage, colors.length)} of {colors.length}
          </span>
          <button
            className="settings__pagination-button"
            onClick={goToNextColorPage}
            disabled={colorPage === totalColorPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Size Management */}
      <div className="settings__section settings__section--boxed">
        <div className="settings__section-header">
          <h3>Size Management</h3>
          <div className="settings__header-actions">
            <button onClick={() => openModal('addSize')} className="settings__add-button">
              + Add Size
            </button>
          </div>
        </div>
        <div className="settings__table-container">
          <table className="settings__table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Actions</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSizes.length > 0 ? (
                paginatedSizes.map((size) => (
                  <tr key={size.id}>
                    <td>
                      <Edit2
                        className="settings__action-icon"
                        onClick={() => openModal('editSize', size.id, size.size_name)}
                      />
                    </td>
                    <td>{size.size_name}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="2">No sizes available</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="settings__pagination">
          <button
            className="settings__pagination-button"
            onClick={goToPreviousSizePage}
            disabled={sizePage === 1}
          >
            Previous
          </button>
          <span className="settings__pagination-info">
            Page {sizePage} of {totalSizePages} | Showing {Math.min((sizePage - 1) * itemsPerPage + 1, sizes.length)}-{Math.min(sizePage * itemsPerPage, sizes.length)} of {sizes.length}
          </span>
          <button
            className="settings__pagination-button"
            onClick={goToNextSizePage}
            disabled={sizePage === totalSizePages}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default AttributesManagement;