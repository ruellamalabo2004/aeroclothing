import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Plus, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import ProductModal from './ProductModal';
import EditModal from './EditModal';

const ViewArchived = ({ token }) => {
  const tableWrapperRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArchivedProducts();
  }, []);

  // Fetch archived products with Authorization token
  const fetchArchivedProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/products?status=archived', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Archived Products:', res.data);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch archived products:', err);
    }
  };

  // Restore selected products
  const handleRestore = async (productIds) => {
    try {
      await Promise.all(
        productIds.map((id) =>
          axios.patch(`http://localhost:8000/api/products/${id}/restore`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      fetchArchivedProducts(); // Refresh the list
    } catch (err) {
      console.error('Failed to restore products:', err);
    }
  };

  const scrollTable = (direction) => {
    const scrollAmount = 300;
    if (tableWrapperRef.current) {
      tableWrapperRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    product.product_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="view-archived">
      <div className="view-archived__header">
        <div>
          <h2 className="view-archived__title">Clothing Product Management</h2>
          <p className="view-archived__subtitle">Select products to perform bulk actions</p>
        </div>
        <div className="view-archived__actions">
          <button
            className="view-archived__button view-archived__button--secondary"
            onClick={() => {
              const selectedIds = products
                .filter((p) => document.querySelector(`input[id="checkbox-${p.id}"]`)?.checked)
                .map((p) => p.id);
              if (selectedIds.length > 0) handleRestore(selectedIds);
            }}
          >
            <RotateCcw size={16} className="view-archived__button-icon" />
            Restore
          </button>
          <button
            className="view-archived__button view-archived__button--primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} className="view-archived__button-icon" />
            Add Product
          </button>
        </div>
      </div>

      <div className="view-archived__search-container">
        <input
          type="text"
          className="view-archived__search"
          placeholder="Search by name, category, or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="view-archived__table-container">
        <div className="view-archived__table-wrapper" ref={tableWrapperRef}>
          <table className="view-archived__table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>Actions</th>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Colors</th>
                <th>Sizes</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <input type="checkbox" id={`checkbox-${product.id}`} />
                  </td>
                  <td className="view-archived__actions-cell">
                    <button
                      className="view-archived__action-button"
                      onClick={() => {
                        setSelectedProductId(product.id);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button className="view-archived__action-button">
                      <Trash2 size={16} />
                    </button>
                  </td>
                  <td>
                    <img
                      src={`http://localhost:8000/storage/${product.image_1}`}
                      alt={product.product_name}
                      className="view-archived__image"
                    />
                  </td>
                  <td>{product.product_name}</td>
                  <td>{product.category?.name || 'N/A'}</td>
                  <td>{product.product_type}</td>
                  <td>
                    {Array.isArray(product.colors) ? product.colors.join(', ') : product.colors || 'N/A'}
                  </td>
                  <td>
                    {Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || 'N/A'}
                  </td>
                  <td>
                    ${parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span
                      className={`view-archived__status view-archived__status--${product.status.toLowerCase()}`}
                    >
                      {product.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="view-archived__scroll-controls">
          <button onClick={() => scrollTable('left')}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => scrollTable('right')}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        token={token}
        onProductAdded={fetchArchivedProducts}
      />
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProductId(null);
        }}
        productId={selectedProductId}
        token={token}
        onProductUpdated={fetchArchivedProducts}
      />
    </div>
  );
};

export default ViewArchived;