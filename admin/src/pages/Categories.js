import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/categories`);
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showAlert('danger', 'Failed to fetch categories. Please try again.');
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.API_URL}/api/categories`, newCategory);
      setNewCategory({ name: '', description: '' });
      fetchCategories();
      showAlert('success', 'Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      showAlert('danger', 'Failed to add category. Please try again.');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${config.API_URL}/api/categories/${editingCategory.id}`, editingCategory);
      setEditingCategory(null);
      setShowModal(false);
      fetchCategories();
      showAlert('success', 'Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      showAlert('danger', 'Failed to update category. Please try again.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${config.API_URL}/api/categories/${id}`);
        fetchCategories();
        showAlert('success', 'Category deleted successfully!');
      } catch (error) {
        console.error('Error deleting category:', error);
        showAlert('danger', 'Failed to delete category. Please try again.');
      }
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  return (
    <>
      {/* Alert Messages */}
      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show shadow-sm`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert({ show: false, type: '', message: '' })} aria-label="Close"></button>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center mb-4">
            <div className="mb-0">Categories</div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <div className="card-title mb-0">Add New Category</div>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddCategory}>
                <div className="mb-3">
                  <label htmlFor="categoryName" className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    required
                    aria-describedby="categoryNameHelp"
                  />
                  <div id="categoryNameHelp" className="form-text text-muted">Enter a descriptive name for the category.</div>
                </div>
                <div className="mb-3">
                  <label htmlFor="categoryDescription" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="categoryDescription"
                    rows="3"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    aria-describedby="categoryDescriptionHelp"
                  />
                  <div id="categoryDescriptionHelp" className="form-text text-muted">Provide additional details about this category.</div>
                </div>
                <button type="submit" className="btn btn-primary">
                  Add Category
                </button>
              </form>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <div className="card-title mb-0">Categories</div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Description</th>
                      <th scope="col" className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center text-muted py-4">
                          No categories found. Add your first category above.
                        </td>
                      </tr>
                    ) : (
                      categories.map((category) => (
                        <tr key={category.id}>
                          <td>{category.name}</td>
                          <td>{category.description}</td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-primary me-2"
                              onClick={() => {
                                setEditingCategory(category);
                                setShowModal(true);
                              }}
                              aria-label={`Edit ${category.name}`}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteCategory(category.id)}
                              aria-label={`Delete ${category.name}`}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Category Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="editCategoryModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header">
                <div className="modal-title" id="editCategoryModalLabel">Edit Category</div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <form onSubmit={handleUpdateCategory}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editCategoryName" className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editCategoryName"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editCategoryDescription" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="editCategoryDescription"
                      rows="3"
                      value={editingCategory.description}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditingCategory(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </>
  );
}

export default Categories; 