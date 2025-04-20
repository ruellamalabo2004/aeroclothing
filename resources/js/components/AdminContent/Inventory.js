import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, PackageCheck, PackageMinus, PackageX, Search, Edit2, Archive, X } from 'lucide-react';
import Success from '../LoginContent/Success';

const BASE_IMAGE_URL = 'http://localhost:8000/storage';

const Inventory = ({ token }) => {
    const [products, setProducts] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSuccessVisible, setIsSuccessVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const productsPerPage = 10;

    // Fetch products and inventory data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, inventoryRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/products', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get('http://localhost:8000/api/inventories', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                console.log('Products:', productsRes.data);
                console.log('Inventory:', inventoryRes.data);
                setProducts(productsRes.data || []);
                setInventory(inventoryRes.data || []);
                setErrorMessage('');
            } catch (err) {
                console.error('Failed to fetch data:', err.response?.data || err.message);
                setErrorMessage(`Failed to fetch data: ${err.response?.data?.message || err.message}`);
            }
        };
        fetchData();
    }, []);

    // Merge products and inventory data
    const mergedProducts = products.map(product => {
        const inventoryItem = inventory.find(item => item.product_id === product.id && !item.archive_at);
        return {
            ...product,
            inventory_id: inventoryItem?.id,
            stock_quantity: inventoryItem?.stock_quantity || 0,
            status: inventoryItem?.status || 'Out of Stock',
            image: product.image_1 ? `${BASE_IMAGE_URL}/${product.image_1}` : 'https://via.placeholder.com/80',
        };
    });

    // Dynamic inventory stats
    const inventoryStats = [
        {
            title: 'Total Products',
            count: mergedProducts.length,
            icon: <Package className="inventory__card-icon" size={48} />,
        },
        {
            title: 'In Stock Products',
            count: mergedProducts.filter(p => p.status === 'In Stock').length,
            icon: <PackageCheck className="inventory__card-icon" size={48} />,
        },
        {
            title: 'Low Stock Products',
            count: mergedProducts.filter(p => p.status === 'Low Stock').length,
            icon: <PackageMinus className="inventory__card-icon" size={48} />,
        },
        {
            title: 'Out of Stock Products',
            count: mergedProducts.filter(p => p.status === 'Out of Stock').length,
            icon: <PackageX className="inventory__card-icon" size={48} />,
        },
    ];

    // Filter products based on search term
    const filteredProducts = mergedProducts.filter(
        (product) =>
            product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
            product.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setSelectedProducts([]);
    };

    const handleCheckboxChange = (productId) => {
        setSelectedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const handleEditClick = (product) => {
        setSelectedItem({
            inventory_id: product.inventory_id,
            product_id: product.id,
            product_name: product.product_name,
            stock_quantity: product.stock_quantity,
            status: product.status,
        });
        setIsEditModalOpen(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setSelectedItem((prev) => ({
            ...prev,
            [name]: name === 'stock_quantity' ? Number(value) : value,
        }));
    };

    const handleSave = async () => {
        if (!selectedItem.product_id || selectedItem.stock_quantity === undefined) {
            setErrorMessage('Product ID and stock quantity are required');
            return;
        }

        try {
            const data = {
                product_id: selectedItem.product_id,
                stock_quantity: Number(selectedItem.stock_quantity),
                status: selectedItem.status,
            };

            let response;
            if (selectedItem.inventory_id) {
                response = await axios.put(
                    `http://localhost:8000/api/inventories/${selectedItem.inventory_id}`,
                    data,
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );
            } else {
                response = await axios.post(
                    `http://localhost:8000/api/inventories`,
                    data,
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );
            }

            setInventory((prev) => {
                if (selectedItem.inventory_id) {
                    return prev.map((item) =>
                        item.id === selectedItem.inventory_id ? response.data : item
                    );
                }
                return [...prev, response.data];
            });
            setIsEditModalOpen(false);
            setSelectedItem(null);
            setSuccessMessage('Inventory updated successfully!');
            setIsSuccessVisible(true);
        } catch (err) {
            console.error('Error saving inventory:', err.response?.data || err.message);
            setErrorMessage(
                err.response?.data?.message ||
                err.response?.data?.errors?.stock_quantity?.[0] ||
                'Failed to save inventory'
            );
        }
    };

    const handleArchive = async (product) => {
        if (!product.inventory_id) {
            setErrorMessage('No inventory record to archive');
            return;
        }

        try {
            await axios.delete(`http://localhost:8000/api/inventories/${product.inventory_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setInventory((prev) => prev.filter((item) => item.id !== product.inventory_id));
            setSuccessMessage('Inventory item archived successfully!');
            setIsSuccessVisible(true);
        } catch (err) {
            console.error('Error archiving inventory:', err.response?.data || err.message);
            setErrorMessage(
                err.response?.data?.message || 'Failed to archive inventory item'
            );
        }
    };

    const handleBulkArchive = async () => {
        if (selectedProducts.length === 0) {
            setErrorMessage('No products selected for archiving');
            return;
        }

        try {
            const archivePromises = selectedProducts
                .map((id) => {
                    const product = mergedProducts.find((p) => p.id === id);
                    return product.inventory_id
                        ? axios.delete(`http://localhost:8000/api/inventories/${product.inventory_id}`, {
                              headers: { Authorization: `Bearer ${token}` },
                          })
                        : null;
                })
                .filter((promise) => promise !== null);

            if (archivePromises.length === 0) {
                setErrorMessage('No valid inventory records selected for archiving');
                return;
            }

            await Promise.all(archivePromises);
            setInventory((prev) =>
                prev.filter(
                    (item) => !selectedProducts.some((id) => {
                        const product = mergedProducts.find((p) => p.id === id);
                        return product.inventory_id === item.id;
                    })
                )
            );
            setSelectedProducts([]);
            setSuccessMessage(`Selected inventory items (${archivePromises.length}) archived successfully!`);
            setIsSuccessVisible(true);
        } catch (err) {
            console.error('Error bulk archiving:', err.response?.data || err.message);
            setErrorMessage(
                err.response?.data?.message || 'Failed to archive selected inventory items'
            );
        }
    };

    return (
        <div className="inventory">
            <h1 className="inventory__title">Inventory Management</h1>
            <div className="inventory__grid">
                {inventoryStats.map((stat, index) => (
                    <div className="inventory__card" key={index}>
                        <div className="inventory__card-content">
                            <h2 className="inventory__card-title">{stat.title}</h2>
                            <p className="inventory__card-count">{stat.count}</p>
                        </div>
                        <div className="inventory__card-icon-wrapper">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="inventory__header">
                <div className="inventory__controls">
                    <div className="inventory__search-wrapper">
                        <Search size={16} className="inventory__search-icon" />
                        <input
                            type="text"
                            className="inventory__search"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {selectedProducts.length > 0 && (
                        <button
                            className="inventory__button inventory__button--secondary"
                            onClick={handleBulkArchive}
                        >
                            <Archive size={16} className="inventory__button-icon" />
                            Archive Selected ({selectedProducts.length})
                        </button>
                    )}
                </div>
            </div>

            {errorMessage && (
                <div style={{ margin: '10px 0', padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
                    {errorMessage}
                </div>
            )}

            <Success
                message={successMessage}
                isVisible={isSuccessVisible}
                onClose={() => setIsSuccessVisible(false)}
            />

            <div className="inventory-table-wrapper">
                <div className="inventory-table-container">
                    <table className="inventory-table">
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
                                        checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                                    />
                                </th>
                                <th scope="col">Actions</th>
                                <th scope="col">Image</th>
                                <th scope="col">Product Name</th>
                                <th scope="col">Category</th>
                                <th scope="col">Price</th>
                                <th scope="col">Quantity</th>
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
                                                onClick={() => handleEditClick(product)}
                                            />
                                            <Archive
                                                className="action-img"
                                                size={16}
                                                onClick={() => handleArchive(product)}
                                            />
                                        </td>
                                        <td>
                                            <div className="product-image-container">
                                                <img 
                                                    src={product.image} 
                                                    alt={product.product_name} 
                                                    className="product-image" 
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/80';
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td>{product.product_name}</td>
                                        <td>{product.category?.name || 'N/A'}</td>
                                        <td>
                                            ${parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td>{product.stock_quantity}</td>
                                        <td>
                                            <span className={`status-frame status-${product.status.toLowerCase().replace(/\s/g, '-')}`}>
                                                {product.status.toLowerCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8">No products available</td>
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

            {isEditModalOpen && (
                <div className="inventory__modal-overlay">
                    <div className="inventory__modal">
                        <div className="inventory__modal-header">
                            <h2 className="inventory__modal-title">Edit Inventory Item</h2>
                            <button
                                className="inventory__modal-close"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="inventory__modal-form">
                            <div className="inventory__form-group">
                                <label className="inventory__form-label">Product</label>
                                <input
                                    type="text"
                                    className="inventory__form-input"
                                    value={selectedItem.product_name || 'N/A'}
                                    disabled
                                />
                            </div>
                            <div className="inventory__form-group">
                                <label className="inventory__form-label">Stock Quantity</label>
                                <input
                                    type="number"
                                    name="stock_quantity"
                                    className="inventory__form-input"
                                    value={selectedItem.stock_quantity || 0}
                                    onChange={handleFormChange}
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="inventory__form-group">
                                <label className="inventory__form-label">Status</label>
                                <select
                                    name="status"
                                    className="inventory__form-input"
                                    value={selectedItem.status || 'Out of Stock'}
                                    onChange={handleFormChange}
                                >
                                    <option value="In Stock">In Stock</option>
                                    <option value="Low Stock">Low Stock</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                </select>
                            </div>
                            <div className="inventory__modal-footer">
                                <button
                                    type="button"
                                    className="inventory__button inventory__button--secondary"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inventory__button inventory__button--primary"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;