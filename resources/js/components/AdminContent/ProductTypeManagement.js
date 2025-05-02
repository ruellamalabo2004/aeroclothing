import React, { useEffect, useState } from 'react';
import { Edit2 } from 'lucide-react';
import axios from 'axios';

const ProductTypeManagement = ({ token, openModal, handleModalSubmit }) => {
  const [productTypes, setProductTypes] = useState([]);
  const [productTypePage, setProductTypePage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const itemsPerPage = 5;

  useEffect(() => {
    fetchProductTypes();
  }, []);

  const fetchProductTypes = async () => {
    try {
      const res = await axios.get('/api/product-types', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mappedProductTypes = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setProductTypes(mappedProductTypes);
      setProductTypePage(1);
    } catch (error) {
      console.error('Failed to fetch product types:', error);
      setSuccessMessage('Failed to load product types.');
    }
  };

  const totalProductTypePages = Math.ceil(productTypes.length / itemsPerPage);
  const paginatedProductTypes = productTypes.slice(
    (productTypePage - 1) * itemsPerPage,
    productTypePage * itemsPerPage
  );

  const goToPreviousProductTypePage = () => {
    if (productTypePage > 1) {
      setProductTypePage(prev => prev - 1);
    }
  };

  const goToNextProductTypePage = () => {
    if (productTypePage < totalProductTypePages) {
      setProductTypePage(prev => prev + 1);
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
          <h3>Product Type Management</h3>
          <div className="settings__header-actions">
            <button onClick={() => openModal('addProductType')} className="settings__add-button">
              + Add Product Type
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
              {paginatedProductTypes.length > 0 ? (
                paginatedProductTypes.map((type) => (
                  <tr key={type.id}>
                    <td>
                      <Edit2
                        className="settings__action-icon"
                        onClick={() => openModal('editProductType', type.id, type.type_name)}
                      />
                    </td>
                    <td>{type.type_name}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="2">No product types available</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="settings__pagination">
          <button
            className="settings__pagination-button"
            onClick={goToPreviousProductTypePage}
            disabled={productTypePage === 1}
          >
            Previous
          </button>
          <span className="settings__pagination-info">
            Page {productTypePage} of {totalProductTypePages} | Showing {Math.min((productTypePage - 1) * itemsPerPage + 1, productTypes.length)}-{Math.min(productTypePage * itemsPerPage, productTypes.length)} of {productTypes.length}
          </span>
          <button
            className="settings__pagination-button"
            onClick={goToNextProductTypePage}
            disabled={productTypePage === totalProductTypePages}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductTypeManagement;