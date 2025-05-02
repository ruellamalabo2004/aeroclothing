import React, { useEffect, useState } from 'react';
import { Edit2, Archive, RotateCcw, X } from 'lucide-react';
import axios from 'axios';
import AttributesManagement from './AttributesManagement';
import ProductTypeManagement from './ProductTypeManagement';
import LocationManagement from './LocationManagement';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('product');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: '', // 'addCategory', 'editCategory', 'addBrand', 'editBrand', etc.
    id: null,
    name: '',
    error: '',
    isLoading: false,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [categoryPage, setCategoryPage] = useState(1);
  const [brandPage, setBrandPage] = useState(1);
  const itemsPerPage = 5;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (activeTab === 'product') {
      fetchCategories();
      fetchBrands();
    }
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mappedCategories = res.data
        .map(category => ({
          ...category,
          status: category.archived_at ? 'archived' : 'active',
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setCategories(mappedCategories);
      setCategoryPage(1);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setSuccessMessage('Failed to load categories.');
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get('/api/brands', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mappedBrands = res.data
        .map(brand => ({
          ...brand,
          status: brand.archived_at ? 'archived' : 'active',
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setBrands(mappedBrands);
      setBrandPage(1);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      setSuccessMessage('Failed to load brands.');
    }
  };

  const toggleCategoryFilter = () => {
    setCategoryFilter(prev => {
      if (prev === 'all') return 'active';
      if (prev === 'active') return 'archived';
      return 'all';
    });
    setCategoryPage(1);
  };

  const toggleBrandFilter = () => {
    setBrandFilter(prev => {
      if (prev === 'all') return 'active';
      if (prev === 'active') return 'archived';
      return 'all';
    });
    setBrandPage(1);
  };

  const filteredCategories = categories.filter(category => {
    if (categoryFilter === 'all') return true;
    return category.status === categoryFilter;
  });

  const filteredBrands = brands.filter(brand => {
    if (brandFilter === 'all') return true;
    return brand.status === brandFilter;
  });

  const totalCategoryPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (categoryPage - 1) * itemsPerPage,
    categoryPage * itemsPerPage
  );

  const totalBrandPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const paginatedBrands = filteredBrands.slice(
    (brandPage - 1) * itemsPerPage,
    brandPage * itemsPerPage
  );

  const goToPreviousCategoryPage = () => {
    if (categoryPage > 1) {
      setCategoryPage(prev => prev - 1);
    }
  };

  const goToNextCategoryPage = () => {
    if (categoryPage < totalCategoryPages) {
      setCategoryPage(prev => prev + 1);
    }
  };

  const goToPreviousBrandPage = () => {
    if (brandPage > 1) {
      setBrandPage(prev => prev - 1);
    }
  };

  const goToNextBrandPage = () => {
    if (brandPage < totalBrandPages) {
      setBrandPage(prev => prev + 1);
    }
  };

  const openModal = (type, id = null, name = '') => {
    setModalState({
      isOpen: true,
      type,
      id,
      name,
      error: '',
      isLoading: false,
    });
    setSuccessMessage('');
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: '', id: null, name: '', error: '', isLoading: false });
  };

  const handleModalSubmit = async (refetch) => {
    if (!modalState.name.trim()) {
      setModalState({ ...modalState, error: 'Name is required' });
      return;
    }

    if (modalState.name.trim().length < 2) {
      setModalState({ ...modalState, error: 'Name must be at least 2 characters' });
      return;
    }

    setModalState({ ...modalState, isLoading: true, error: '' });

    try {
      const headers = { Authorization: `Bearer ${token}` };
      let response;

      if (modalState.type === 'addCategory') {
        response = await axios.post('/api/categories', { name: modalState.name }, { headers });
        setSuccessMessage('Category added successfully');
        fetchCategories();
      } else if (modalState.type === 'editCategory') {
        response = await axios.put(`/api/categories/${modalState.id}`, { name: modalState.name }, { headers });
        setSuccessMessage('Category updated successfully');
        fetchCategories();
      } else if (modalState.type === 'addBrand') {
        response = await axios.post('/api/brands', { name: modalState.name }, { headers });
        setSuccessMessage('Brand added successfully');
        fetchBrands();
      } else if (modalState.type === 'editBrand') {
        response = await axios.put(`/api/brands/${modalState.id}`, { name: modalState.name }, { headers });
        setSuccessMessage('Brand updated successfully');
        fetchBrands();
      } else if (modalState.type === 'addColor') {
        response = await axios.post('/api/colors', { color_name: modalState.name }, { headers });
        setSuccessMessage('Color added successfully');
        refetch();
      } else if (modalState.type === 'editColor') {
        response = await axios.put(`/api/colors/${modalState.id}`, { color_name: modalState.name }, { headers });
        setSuccessMessage('Color updated successfully');
        refetch();
      } else if (modalState.type === 'addSize') {
        response = await axios.post('/api/sizes', { size_name: modalState.name }, { headers });
        setSuccessMessage('Size added successfully');
        refetch();
      } else if (modalState.type === 'editSize') {
        response = await axios.put(`/api/sizes/${modalState.id}`, { size_name: modalState.name }, { headers });
        setSuccessMessage('Size updated successfully');
        refetch();
      } else if (modalState.type === 'addProductType') {
        response = await axios.post('/api/product-types', { type_name: modalState.name }, { headers });
        setSuccessMessage('Product type added successfully');
        refetch();
      } else if (modalState.type === 'editProductType') {
        response = await axios.put(`/api/product-types/${modalState.id}`, { type_name: modalState.name }, { headers });
        setSuccessMessage('Product type updated successfully');
        refetch();
      } else if (modalState.type === 'addCountry') {
        response = await axios.post('/api/countries', { name: modalState.name }, { headers });
        setSuccessMessage('Country added successfully');
        refetch();
      } else if (modalState.type === 'editCountry') {
        response = await axios.put(`/api/countries/${modalState.id}`, { name: modalState.name }, { headers });
        setSuccessMessage('Country updated successfully');
        refetch();
      }

      closeModal();
    } catch (error) {
      console.error(`Error ${modalState.type}:`, error);
      setModalState({
        ...modalState,
        error: error.response?.data?.message || 'Failed to save. Please try again.',
        isLoading: false,
      });
    }
  };

  const handleArchive = async (type, id) => {
    if (window.confirm(`Are you sure you want to archive this ${type}?`)) {
      try {
        await axios.patch(`/api/${type}s/${id}/archive`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} archived successfully`);
        if (type === 'category') fetchCategories();
        else if (type === 'brand') fetchBrands();
      } catch (error) {
        console.error(`Error archiving ${type}:`, error);
        setSuccessMessage(`Failed to archive ${type}.`);
      }
    }
  };

  const handleRestore = async (type, id) => {
    if (window.confirm(`Are you sure you want to restore this ${type}?`)) {
      try {
        await axios.patch(`/api/${type}s/${id}/restore`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} restored successfully`);
        if (type === 'category') fetchCategories();
        else if (type === 'brand') fetchBrands();
      } catch (error) {
        console.error(`Error restoring ${type}:`, error);
        setSuccessMessage(`Failed to restore ${type}.`);
      }
    }
  };

  return (
    <div className="settings">
      <h1 className="settings__title">Admin Settings</h1>
      <div className="settings__tabs">
        <button
          className={`settings__tab ${activeTab === 'product' ? 'active' : ''}`}
          onClick={() => setActiveTab('product')}
        >
          Product Settings
        </button>
        <button
          className={`settings__tab ${activeTab === 'attributes' ? 'active' : ''}`}
          onClick={() => setActiveTab('attributes')}
        >
          Attributes
        </button>
        <button
          className={`settings__tab ${activeTab === 'product-type' ? 'active' : ''}`}
          onClick={() => setActiveTab('product-type')}
        >
          Product Type Settings
        </button>
        <button
          className={`settings__tab ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab('location')}
        >
          Location Settings
        </button>
      </div>

      <div className="settings__content">
        {activeTab === 'product' && (
          <>
            {successMessage && (
              <div className={`settings__message ${successMessage.includes('Failed') ? 'settings__error' : 'settings__success'}`}>
                {successMessage}
              </div>
            )}

            {/* Category Management */}
            <div className="settings__section settings__section--boxed">
              <div className="settings__section-header">
                <h3>Category Management</h3>
                <div className="settings__header-actions">
                  <button onClick={toggleCategoryFilter} className="settings__filter-button">
                    Showing: {categoryFilter === 'all' ? 'All' : categoryFilter === 'active' ? 'Active' : 'Archived'}
                  </button>
                  <button onClick={() => openModal('addCategory')} className="settings__add-button">
                    + Add Category
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
                    {paginatedCategories.length > 0 ? (
                      paginatedCategories.map((category) => (
                        <tr key={category.id}>
                          <td>
                            <Edit2
                              className="settings__action-icon"
                              onClick={() => openModal('editCategory', category.id, category.name)}
                            />
                            {category.status === 'active' ? (
                              <Archive
                                className="settings__action-icon"
                                onClick={() => handleArchive('category', category.id)}
                              />
                            ) : (
                              <RotateCcw
                                className="settings__action-icon"
                                onClick={() => handleRestore('category', category.id)}
                              />
                            )}
                          </td>
                          <td>{category.name}</td>
                          <td>
                            <span className={`settings__status settings__status--${category.status}`}>
                              {category.status === 'active' ? 'Active' : 'Archived'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="3">No categories available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="settings__pagination">
                <button
                  className="settings__pagination-button"
                  onClick={goToPreviousCategoryPage}
                  disabled={categoryPage === 1}
                >
                  Previous
                </button>
                <span className="settings__pagination-info">
                  Page {categoryPage} of {totalCategoryPages} | Showing {Math.min((categoryPage - 1) * itemsPerPage + 1, filteredCategories.length)}-{Math.min(categoryPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length}
                </span>
                <button
                  className="settings__pagination-button"
                  onClick={goToNextCategoryPage}
                  disabled={categoryPage === totalCategoryPages}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Brand Management */}
            <div className="settings__section settings__section--boxed">
              <div className="settings__section-header">
                <h3>Brand Management</h3>
                <div className="settings__header-actions">
                  <button onClick={toggleBrandFilter} className="settings__filter-button">
                    Showing: {brandFilter === 'all' ? 'All' : brandFilter === 'active' ? 'Active' : 'Archived'}
                  </button>
                  <button onClick={() => openModal('addBrand')} className="settings__add-button">
                    + Add Brand
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
                    {paginatedBrands.length > 0 ? (
                      paginatedBrands.map((brand) => (
                        <tr key={brand.id}>
                          <td>
                            <Edit2
                              className="settings__action-icon"
                              onClick={() => openModal('editBrand', brand.id, brand.name)}
                            />
                            {brand.status === 'active' ? (
                              <Archive
                                className="settings__action-icon"
                                onClick={() => handleArchive('brand', brand.id)}
                              />
                            ) : (
                              <RotateCcw
                                className="settings__action-icon"
                                onClick={() => handleRestore('brand', brand.id)}
                              />
                            )}
                          </td>
                          <td>{brand.name}</td>
                          <td>
                            <span className={`settings__status settings__status--${brand.status}`}>
                              {brand.status === 'active' ? 'Active' : 'Archived'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="3">No brands available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="settings__pagination">
                <button
                  className="settings__pagination-button"
                  onClick={goToPreviousBrandPage}
                  disabled={brandPage === 1}
                >
                  Previous
                </button>
                <span className="settings__pagination-info">
                  Page {brandPage} of {totalBrandPages} | Showing {Math.min((brandPage - 1) * itemsPerPage + 1, filteredBrands.length)}-{Math.min(brandPage * itemsPerPage, filteredBrands.length)} of {filteredBrands.length}
                </span>
                <button
                  className="settings__pagination-button"
                  onClick={goToNextBrandPage}
                  disabled={brandPage === totalBrandPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'attributes' && (
          <AttributesManagement
            token={token}
            openModal={openModal}
            handleModalSubmit={handleModalSubmit}
          />
        )}

        {activeTab === 'product-type' && (
          <ProductTypeManagement
            token={token}
            openModal={openModal}
            handleModalSubmit={handleModalSubmit}
          />
        )}

        {activeTab === 'location' && (
          <LocationManagement
            token={token}
            openModal={openModal}
            handleModalSubmit={handleModalSubmit}
            handleArchive={handleArchive}
            handleRestore={handleRestore}
          />
        )}
      </div>

      {/* Unified Modal */}
      {modalState.isOpen && (
        <div className="settings__modal-overlay">
          <div className="settings__modal">
            <button className="settings__modal-close" onClick={closeModal}>
              <X size={20} />
            </button>
            <h3 className="settings__modal-title">
              {modalState.type === 'addCategory' && 'Add New Category'}
              {modalState.type === 'editCategory' && 'Edit Category'}
              {modalState.type === 'addBrand' && 'Add New Brand'}
              {modalState.type === 'editBrand' && 'Edit Brand'}
              {modalState.type === 'addColor' && 'Add New Color'}
              {modalState.type === 'editColor' && 'Edit Color'}
              {modalState.type === 'addSize' && 'Add New Size'}
              {modalState.type === 'editSize' && 'Edit Size'}
              {modalState.type === 'addProductType' && 'Add New Product Type'}
              {modalState.type === 'editProductType' && 'Edit Product Type'}
              {modalState.type === 'addCountry' && 'Add New Country'}
              {modalState.type === 'editCountry' && 'Edit Country'}
            </h3>
            <div className="settings__form-group">
              <label htmlFor="modal-name">Name</label>
              <input
                id="modal-name"
                type="text"
                value={modalState.name}
                onChange={(e) => setModalState({ ...modalState, name: e.target.value, error: '' })}
                placeholder="Enter name"
                disabled={modalState.isLoading}
                className={modalState.error ? 'settings__input--error' : ''}
              />
              {modalState.error && <span className="settings__error">{modalState.error}</span>}
            </div>
            <div className="settings__modal-actions">
              <button
                className="settings__modal-button settings__modal-button--cancel"
                onClick={closeModal}
                disabled={modalState.isLoading}
              >
                Cancel
              </button>
              <button
                className="settings__modal-button settings__modal-button--submit"
                onClick={() => handleModalSubmit()}
                disabled={modalState.isLoading}
              >
                {modalState.isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;