import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Archive, Plus, Search, Edit2, RotateCcw } from 'lucide-react';
import ProductModal from './ProductModal';
import EditModal from './EditModal';

const Products = ({ token }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, [showArchived]);

  // Fetch products with Authorization token, filtered by archived status if needed
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Products:', res.data);
      const filteredProducts = showArchived
        ? res.data.filter((product) => product.status === 'archived')
        : res.data;
      setProducts(filteredProducts);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  // Handle archive or restore action
  const handleAction = async (productId, status, action) => {
    try {
      if (action === 'restore') {
        const res = await axios.patch(
          `http://localhost:8000/api/products/${productId}/restore`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('Restore response:', res.data);
      } else if (action === 'archive') {
        const res = await axios.patch(
          `http://localhost:8000/api/products/${productId}/archive`,
          { status: 'archived' },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('Archive response:', res.data);
      }
      fetchProducts(); // Refresh the list
    } catch (err) {
      console.error(`Failed to ${action} product:`, err.response?.data || err.message);
    }
  };

  // Handle edit action
  const handleEdit = (productId) => {
    setSelectedProductId(productId);
    setIsEditModalOpen(true);
  };

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      product.product_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCheckboxChange = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="products">
      <div className="products__header">
        <div>
          <h2 className="products__title">Product Management</h2>
          <p className="products__subtitle">Select products to perform bulk actions</p>
        </div>
        
        <div className="products__controls">
          <div className="products__search-wrapper">
            <Search size={16} className="products__search-icon" />
            <input
              type="text"
              className="products__search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="products__actions">
            <button
              className="products__button products__button--secondary"
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive size={16} className="products__button-icon" />
              {showArchived ? 'View All' : 'View Archived'}
            </button>
            <button
              className="products__button products__button--primary"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} className="products__button-icon" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="products-table-wrapper">
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th scope="col">
                  <input
                    type="checkbox"
                    onChange={() => {
                      if (selectedProducts.length === currentProducts.length) {
                        setSelectedProducts([]);
                      } else {
                        setSelectedProducts(currentProducts.map((p) => p.id));
                      }
                    }}
                    checked={selectedProducts.length === currentProducts.length}
                  />
                </th>
                <th scope="col">Actions</th>
                <th scope="col">Image</th>
                <th scope="col">Product Name</th>
                <th scope="col">Category</th>
                <th scope="col">Type</th>
                <th scope="col">Sizes</th>
                <th scope="col">Price</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleCheckboxChange(product.id)}
                      />
                    </td>
                    <td>
                      <Edit2
                        className="action-img"
                        size={16}
                        onClick={() => handleEdit(product.id)}
                      />
                      <span
                        className="action-img"
                        onClick={() =>
                          handleAction(
                            product.id,
                            product.status,
                            product.status === 'archived' ? 'restore' : 'archive'
                          )
                        }
                      >
                        {product.status === 'archived' ? <RotateCcw size={16} /> : <Archive size={16} />}
                      </span>
                    </td>
                    <td>
                      <img
                        src={`http://localhost:8000/storage/${product.image_1}`}
                        alt={product.product_name}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/40';
                        }}
                      />
                    </td>
                    <td>{product.product_name}</td>
                    <td>{product.category?.name || 'N/A'}</td>
                    <td>{product.product_type}</td>
                    <td>
                      {Array.isArray(product.sizes)
                        ? product.sizes.join(', ')
                        : product.sizes || 'N/A'}
                    </td>
                    <td>
                      ${parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`status-frame status-${product.status}`}>
                        {product.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9">No products available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        token={token}
        onProductAdded={fetchProducts}
      />
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProductId(null);
        }}
        productId={selectedProductId}
        token={token}
        onProductUpdated={fetchProducts}
      />
    </div>
  );
};

export default Products;