import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    <div>
      <h2>Manage Parameters</h2>
      
      {/* Add Parameter Form */}
      <form onSubmit={handleAddParameter} className="form-group">
        <h3>Add New Parameter</h3>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={newParameter.name}
            onChange={(e) => setNewParameter({ ...newParameter, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={newParameter.description}
            onChange={(e) => setNewParameter({ ...newParameter, description: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Category:</label>
          <select
            value={newParameter.categoryId}
            onChange={(e) => setNewParameter({ ...newParameter, categoryId: e.target.value })}
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
            value={newParameter.type}
            onChange={(e) => setNewParameter({ ...newParameter, type: e.target.value })}
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
            value={newParameter.visibility}
            onChange={(e) => setNewParameter({ ...newParameter, visibility: e.target.value })}
          >
            <option value="Basic">Basic</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        {['Dropdown', 'Radio Buttons', 'Checkbox'].includes(newParameter.type) && (
          <div className="form-group">
            <label>Values:</label>
            <div className="values-container">
              {newParameter.values.map((value, index) => (
                <div key={index} className="value-item">
                  <span>{value.label}</span>
                  <button
                    type="button"
                    className="button button-danger"
                    onClick={() => handleRemoveValue(index)}
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
                  onClick={handleAddValue}
                >
                  Add Value
                </button>
              </div>
            </div>
          </div>
        )}
        <button type="submit" className="button button-primary">Add Parameter</button>
      </form>

      {/* Parameters Table */}
      <table className="data-table">
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
          {parameters.map((parameter) => (
            <tr key={parameter.id}>
              <td>{parameter.name}</td>
              <td>{parameter.description}</td>
              <td>{parameter.type}</td>
              <td>{categories.find(c => c.id === parameter.categoryId)?.name || parameter.categoryId}</td>
              <td>{parameter.visibility}</td>
              <td>
                <button
                  className="button button-primary"
                  onClick={() => setEditingParameter(parameter)}
                >
                  Edit
                </button>
                <button
                  className="button button-danger"
                  onClick={() => handleDeleteParameter(parameter.id)}
                >
                  Delete
                </button>
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