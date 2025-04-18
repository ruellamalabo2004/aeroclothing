import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit2, Archive, RotateCcw, X } from 'lucide-react';

const AdminSettings = () => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: '', // 'addCategory', 'editCategory', 'addBrand', 'editBrand'
    id: null,
    name: '',
    error: '',
    isLoading: false,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, active, archived
  const [brandFilter, setBrandFilter] = useState('all'); // all, active, archived
  const [categoryPage, setCategoryPage] = useState(1);
  const [brandPage, setBrandPage] = useState(1);
  const itemsPerPage = 5;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Map archived_at to status and sort by created_at descending
      const mappedCategories = res.data
        .map(category => ({
          ...category,
          status: category.archived_at ? 'archived' : 'active',
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setCategories(mappedCategories);
      setCategoryPage(1); // Reset to page 1 on data fetch
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
      // Map archived_at to status and sort by created_at descending
      const mappedBrands = res.data
        .map(brand => ({
          ...brand,
          status: brand.archived_at ? 'archived' : 'active',
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setBrands(mappedBrands);
      setBrandPage(1); // Reset to page 1 on data fetch
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
    setCategoryPage(1); // Reset to page 1 when changing filter
  };

  const toggleBrandFilter = () => {
    setBrandFilter(prev => {
      if (prev === 'all') return 'active';
      if (prev === 'active') return 'archived';
      return 'all';
    });
    setBrandPage(1); // Reset to page 1 when changing filter
  };

  const filteredCategories = categories.filter(category => {
    if (categoryFilter === 'all') return true;
    return category.status === categoryFilter;
  });

  const filteredBrands = brands.filter(brand => {
    if (brandFilter === 'all') return true;
    return brand.status === brandFilter;
  });

  // Pagination for Categories
  const totalCategoryPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (categoryPage - 1) * itemsPerPage,
    categoryPage * itemsPerPage
  );

  // Pagination for Brands
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

  const handleModalSubmit = async () => {
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

  const handleArchiveCategory = async (id) => {
    if (window.confirm('Are you sure you want to archive this category?')) {
      try {
        await axios.patch(`/api/categories/${id}/archive`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage('Category archived successfully');
        fetchCategories();
      } catch (error) {
        console.error('Error archiving category:', error);
        setSuccessMessage('Failed to archive category.');
      }
    }
  };

  const handleRestoreCategory = async (id) => {
    if (window.confirm('Are you sure you want to restore this category?')) {
      try {
        await axios.patch(`/api/categories/${id}/restore`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage('Category restored successfully');
        fetchCategories();
      } catch (error) {
        console.error('Error restoring category:', error);
        setSuccessMessage('Failed to restore category.');
      }
    }
  };

  const handleArchiveBrand = async (id) => {
    if (window.confirm('Are you sure you want to archive this brand?')) {
      try {
        await axios.patch(`/api/brands/${id}/archive`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage('Brand archived successfully');
        fetchBrands();
      } catch (error) {
        console.error('Error archiving brand:', error);
        setSuccessMessage('Failed to archive brand.');
      }
    }
  };

  const handleRestoreBrand = async (id) => {
    if (window.confirm('Are you sure you want to restore this brand?')) {
      try {
        await axios.patch(`/api/brands/${id}/restore`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage('Brand restored successfully');
        fetchBrands();
      } catch (error) {
        console.error('Error restoring brand:', error);
        setSuccessMessage('Failed to restore brand.');
      }
    }
  };

  return (
    <div className="admin-settings__content">
      {/* Success/Error Message */}
      {successMessage && (
        <div className={`admin-settings__message ${successMessage.includes('Failed') ? 'admin-settings__error' : 'admin-settings__success'}`}>
          {successMessage}
        </div>
      )}

      {/* Categories */}
      <div className="admin-settings__section admin-settings__section--boxed">
        <div className="admin-settings__section-header">
          <h2 className="admin-settings__section-title">Categories Management</h2>
          <div className="admin-settings__header-actions">
            <button onClick={toggleCategoryFilter} className="admin-settings__filter-button">
              Showing: {categoryFilter === 'all' ? 'All' : categoryFilter === 'active' ? 'Active' : 'Archived'}
            </button>
            <button onClick={() => openModal('addCategory')} className="admin-settings__add-button">
              + Add Category
            </button>
          </div>
        </div>
        <div className="admin-settings__table-container">
          <table className="admin-settings__table">
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
                        className="admin-settings__action-icon"
                        onClick={() => openModal('editCategory', category.id, category.name)}
                      />
                      {category.status === 'active' ? (
                        <Archive
                          className="admin-settings__action-icon"
                          onClick={() => handleArchiveCategory(category.id)}
                        />
                      ) : (
                        <RotateCcw
                          className="admin-settings__action-icon"
                          onClick={() => handleRestoreCategory(category.id)}
                        />
                      )}
                    </td>
                    <td>{category.name}</td>
                    <td>
                      <span className={`admin-settings__status admin-settings__status--${category.status}`}>
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
        <div className="admin-settings__pagination">
          <button
            className="admin-settings__pagination-button"
            onClick={goToPreviousCategoryPage}
            disabled={categoryPage === 1}
          >
            Previous
          </button>
          <span className="admin-settings__pagination-info">
            Page {categoryPage} of {totalCategoryPages} | Showing {Math.min((categoryPage - 1) * itemsPerPage + 1, filteredCategories.length)}-{Math.min(categoryPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length}
          </span>
          <button
            className="admin-settings__pagination-button"
            onClick={goToNextCategoryPage}
            disabled={categoryPage === totalCategoryPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Brands */}
      <div className="admin-settings__section admin-settings__section--boxed">
        <div className="admin-settings__section-header">
          <h2 className="admin-settings__section-title">Brands Management</h2>
          <div className="admin-settings__header-actions">
            <button onClick={toggleBrandFilter} className="admin-settings__filter-button">
              Showing: {brandFilter === 'all' ? 'All' : brandFilter === 'active' ? 'Active' : 'Archived'}
            </button>
            <button onClick={() => openModal('addBrand')} className="admin-settings__add-button">
              + Add Brand
            </button>
          </div>
        </div>
        <div className="admin-settings__table-container">
          <table className="admin-settings__table">
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
                        className="admin-settings__action-icon"
                        onClick={() => openModal('editBrand', brand.id, brand.name)}
                      />
                      {brand.status === 'active' ? (
                        <Archive
                          className="admin-settings__action-icon"
                          onClick={() => handleArchiveBrand(brand.id)}
                        />
                      ) : (
                        <RotateCcw
                          className="admin-settings__action-icon"
                          onClick={() => handleRestoreBrand(brand.id)}
                        />
                      )}
                    </td>
                    <td>{brand.name}</td>
                    <td>
                      <span className={`admin-settings__status admin-settings__status--${brand.status}`}>
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
        <div className="admin-settings__pagination">
          <button
            className="admin-settings__pagination-button"
            onClick={goToPreviousBrandPage}
            disabled={brandPage === 1}
          >
            Previous
          </button>
          <span className="admin-settings__pagination-info">
            Page {brandPage} of {totalBrandPages} | Showing {Math.min((brandPage - 1) * itemsPerPage + 1, filteredBrands.length)}-{Math.min(brandPage * itemsPerPage, filteredBrands.length)} of {filteredBrands.length}
          </span>
          <button
            className="admin-settings__pagination-button"
            onClick={goToNextBrandPage}
            disabled={brandPage === totalBrandPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Unified Modal */}
      {modalState.isOpen && (
        <div className="admin-settings__modal-overlay">
          <div className="admin-settings__modal">
            <button className="admin-settings__modal-close" onClick={closeModal}>
              <X size={20} />
            </button>
            <h3 className="admin-settings__modal-title">
              {modalState.type === 'addCategory' && 'Add New Category'}
              {modalState.type === 'editCategory' && 'Edit Category'}
              {modalState.type === 'addBrand' && 'Add New Brand'}
              {modalState.type === 'editBrand' && 'Edit Brand'}
            </h3>
            <div className="admin-settings__form-group">
              <label htmlFor="modal-name">Name</label>
              <input
                id="modal-name"
                type="text"
                value={modalState.name}
                onChange={(e) => setModalState({ ...modalState, name: e.target.value, error: '' })}
                placeholder="Enter name"
                disabled={modalState.isLoading}
                className={modalState.error ? 'admin-settings__input--error' : ''}
              />
              {modalState.error && <span className="admin-settings__error">{modalState.error}</span>}
            </div>
            <div className="admin-settings__modal-actions">
              <button
                className="admin-settings__modal-button admin-settings__modal-button--cancel"
                onClick={closeModal}
                disabled={modalState.isLoading}
              >
                Cancel
              </button>
              <button
                className="admin-settings__modal-button admin-settings__modal-button--submit"
                onClick={handleModalSubmit}
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