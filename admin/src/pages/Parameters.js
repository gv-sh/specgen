import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import '../styles/Parameters.css';
import config from '../config';

function Parameters() {
  const [parameters, setParameters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newParameter, setNewParameter] = useState({
    name: '',
    description: '',
    type: 'Dropdown',
    categoryId: '',
    values: [],
    visibility: 'Basic'
  });
  const [editingParameter, setEditingParameter] = useState(null);
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    fetchParameters();
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

  const fetchParameters = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/parameters`);
      setParameters(response.data.data);
    } catch (error) {
      console.error('Error fetching parameters:', error);
    }
  };

  const handleAddValue = () => {
    if (newValue.trim()) {
      setNewParameter(prev => ({
        ...prev,
        values: [...prev.values, { id: newValue.trim().toLowerCase(), label: newValue.trim() }]
      }));
      setNewValue('');
    }
  };

  const handleRemoveValue = (index) => {
    setNewParameter(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }));
  };

  const handleAddParameter = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.API_URL}/api/parameters`, newParameter);
      setNewParameter({
        name: '',
        description: '',
        type: 'Dropdown',
        categoryId: '',
        values: [],
        visibility: 'Basic'
      });
      fetchParameters();
    } catch (error) {
      console.error('Error adding parameter:', error);
      alert(error.response?.data?.error || 'Error adding parameter');
    }
  };

  const handleUpdateParameter = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${config.API_URL}/api/parameters/${editingParameter.id}`, editingParameter);
      setEditingParameter(null);
      fetchParameters();
    } catch (error) {
      console.error('Error updating parameter:', error);
      alert(error.response?.data?.error || 'Error updating parameter');
    }
  };

  const handleDeleteParameter = async (id) => {
    try {
      await axios.delete(`${config.API_URL}/api/parameters/${id}`);
      fetchParameters();
    } catch (error) {
      console.error('Error deleting parameter:', error);
      alert(error.response?.data?.error || 'Error deleting parameter');
    }
  };

  return (
    <div className="parameters-container">
      <header className="page-header">
        <h1 className="page-title">Manage Parameters</h1>
      </header>

      <form className="parameter-form" onSubmit={handleAddParameter}>
        <h2 className="form-title">Add New Parameter</h2>
        
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Name:</label>
            <input
              type="text"
              className="form-input"
              value={newParameter.name}
              onChange={(e) => setNewParameter({ ...newParameter, name: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Category:</label>
            <select
              className="form-select"
              value={newParameter.categoryId}
              onChange={(e) => setNewParameter({ ...newParameter, categoryId: e.target.value })}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Type:</label>
            <select
              className="form-select"
              value={newParameter.type}
              onChange={(e) => setNewParameter({ ...newParameter, type: e.target.value })}
              required
            >
              <option value="">Select a type</option>
              <option value="Dropdown">Dropdown</option>
              <option value="Slider">Slider</option>
              <option value="Toggle">Toggle</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Visibility:</label>
            <select
              className="form-select"
              value={newParameter.visibility}
              onChange={(e) => setNewParameter({ ...newParameter, visibility: e.target.value })}
              required
            >
              <option value="">Select visibility</option>
              <option value="Basic">Basic</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Description:</label>
          <textarea
            className="form-input form-textarea"
            value={newParameter.description}
            onChange={(e) => setNewParameter({ ...newParameter, description: e.target.value })}
            required
          />
        </div>

        <div className="values-section">
          <div className="values-header">
            <label className="form-label">Values:</label>
          </div>
          <div className="values-container">
            <input
              type="text"
              className="value-input"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Add a value"
            />
            <button
              type="button"
              className="button-secondary"
              onClick={handleAddValue}
            >
              <FiPlus /> Add Value
            </button>
          </div>
          {newParameter.values.length > 0 && (
            <ul className="values-list">
              {newParameter.values.map((value, index) => (
                <li key={index}>{value.label}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="action-buttons">
          <button type="submit" className="button-primary">
            Add Parameter
          </button>
        </div>
      </form>

      <table className="parameters-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Type</th>
            <th>Category</th>
            <th>Visibility</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((param) => (
            <tr key={param.id}>
              <td>{param.name}</td>
              <td>{param.description}</td>
              <td>{param.type}</td>
              <td>{categories.find(c => c.id === param.categoryId)?.name || param.categoryId}</td>
              <td>{param.visibility}</td>
              <td>
                <div className="table-actions">
                  <button
                    className="button-secondary"
                    onClick={() => setEditingParameter(param)}
                  >
                    <FiEdit2 />
                    Edit
                  </button>
                  <button
                    className="button-danger"
                    onClick={() => handleDeleteParameter(param.id)}
                  >
                    <FiTrash2 />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Parameter Modal */}
      {editingParameter && (
        <div className="modal">
          <h3>Edit Parameter</h3>
          <form onSubmit={handleUpdateParameter}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={editingParameter.name}
                onChange={(e) => setEditingParameter({ ...editingParameter, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={editingParameter.description}
                onChange={(e) => setEditingParameter({ ...editingParameter, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Category:</label>
              <select
                value={editingParameter.categoryId}
                onChange={(e) => setEditingParameter({ ...editingParameter, categoryId: e.target.value })}
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Type:</label>
              <select
                value={editingParameter.type}
                onChange={(e) => setEditingParameter({ ...editingParameter, type: e.target.value })}
                required
              >
                <option value="Dropdown">Dropdown</option>
                <option value="Slider">Slider</option>
                <option value="Toggle Switch">Toggle Switch</option>
                <option value="Radio Buttons">Radio Buttons</option>
                <option value="Checkbox">Checkbox</option>
              </select>
            </div>
            <div className="form-group">
              <label>Visibility:</label>
              <select
                value={editingParameter.visibility}
                onChange={(e) => setEditingParameter({ ...editingParameter, visibility: e.target.value })}
              >
                <option value="Basic">Basic</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            {['Dropdown', 'Radio Buttons', 'Checkbox'].includes(editingParameter.type) && (
              <div className="form-group">
                <label>Values:</label>
                <div className="values-container">
                  {editingParameter.values.map((value, index) => (
                    <div key={index} className="value-item">
                      <span>{value.label}</span>
                      <button
                        type="button"
                        className="button button-danger"
                        onClick={() => {
                          setEditingParameter(prev => ({
                            ...prev,
                            values: prev.values.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="add-value">
                    <input
                      type="text"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="Add a value"
                    />
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => {
                        if (newValue.trim()) {
                          setEditingParameter(prev => ({
                            ...prev,
                            values: [...prev.values, { id: newValue.trim().toLowerCase(), label: newValue.trim() }]
                          }));
                          setNewValue('');
                        }
                      }}
                    >
                      Add Value
                    </button>
                  </div>
                </div>
              </div>
            )}
            <button type="submit" className="button button-primary">Update</button>
            <button
              type="button"
              className="button button-danger"
              onClick={() => setEditingParameter(null)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Parameters; 