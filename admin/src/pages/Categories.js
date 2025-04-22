import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/categories`);
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.API_URL}/api/categories`, newCategory);
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${config.API_URL}/api/categories/${editingCategory.id}`, editingCategory);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await axios.delete(`${config.API_URL}/api/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div>
      <h2>Manage Categories</h2>
      
      {/* Add Category Form */}
      <form onSubmit={handleAddCategory} className="form-group">
        <h3>Add New Category</h3>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
          />
        </div>
        <button type="submit" className="button button-primary">Add Category</button>
      </form>

      {/* Categories Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>{category.description}</td>
              <td>
                <button
                  className="button button-primary"
                  onClick={() => setEditingCategory(category)}
                >
                  Edit
                </button>
                <button
                  className="button button-danger"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="modal">
          <h3>Edit Category</h3>
          <form onSubmit={handleUpdateCategory}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={editingCategory.description}
                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
              />
            </div>
            <button type="submit" className="button button-primary">Update</button>
            <button
              type="button"
              className="button button-danger"
              onClick={() => setEditingCategory(null)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Categories; 