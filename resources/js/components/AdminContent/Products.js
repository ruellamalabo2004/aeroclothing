import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Archive, Plus } from 'lucide-react';
import ProductModal from './ProductModal';
import EditModal from './EditModal';
import ProductTable from './ProductTable'; // Import the new ProductTable component

const Products = ({ token }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="products">
      <div className="products__header">
        <div>
          <h2 className="products__title">Product Management</h2>
          <p className="products__subtitle">Select products to perform bulk actions</p>
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

      {/* Use ProductTable component instead of the inline table */}
      <ProductTable
        products={products}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showArchived={showArchived}
        onEdit={handleEdit}
        onAction={handleAction}
      />

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