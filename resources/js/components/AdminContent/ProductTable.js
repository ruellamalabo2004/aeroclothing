import React, { useState } from 'react';
import { Edit2, Archive, RotateCcw } from 'lucide-react';

const ProductTable = ({ products, searchTerm, onEdit, onAction }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Filter products based on search term (passed from Products.js)
  const filteredProducts = products.filter((product) =>
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
    <div>
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>
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
                      onClick={() => onEdit(product.id)}
                    />
                    <span
                      className="action-img"
                      onClick={() =>
                        onAction(
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
                      onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }}
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
                    <span className={`status-frame status-${product.status}`}>
                      {product.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10">No products available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - Moved outside products-table-container */}
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
    </div>
  );
};

export default ProductTable;