import React, { useState, useEffect, useCallback } from 'react';
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
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/categories`);
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showAlert('danger', 'Failed to fetch categories. Please try again.');
    }
  }, []);

  const fetchParameters = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/parameters`);
      setParameters(response.data.data);
    } catch (error) {
      console.error('Error fetching parameters:', error);
      showAlert('danger', 'Failed to fetch parameters. Please try again.');
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchParameters();
  }, [fetchCategories, fetchParameters]);

  const handleAddValue = () => {
    if (newValue.trim()) {
      setEditingParameter(prev => ({
        ...prev,
        values: [...prev.values, newValue.trim()]
      }));
      setNewValue('');
    }
  };

  const handleRemoveValue = (index) => {
    setEditingParameter(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }));
  };

  const handleAddParameter = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.post(`${config.API_URL}/api/parameters`, newParameter);
      setNewParameter({
        name: '',
        description: '',
        type: 'String',
        categoryId: '',
        values: [],
        visibility: true
      });
      fetchParameters();
      showAlert('success', 'Parameter added successfully');
    } catch (error) {
      console.error('Error adding parameter:', error);
      showAlert('danger', 'Failed to add parameter');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateParameter = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.put(`${config.API_URL}/api/parameters/${editingParameter.id}`, editingParameter);
      setShowModal(false);
      setEditingParameter(null);
      fetchParameters();
      showAlert('success', 'Parameter updated successfully');
    } catch (error) {
      console.error('Error updating parameter:', error);
      showAlert('danger', 'Failed to update parameter');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteParameter = async (id) => {
    if (window.confirm('Are you sure you want to delete this parameter?')) {
      try {
        setIsLoading(true);
        await axios.delete(`${config.API_URL}/api/parameters/${id}`);
        fetchParameters();
        showAlert('success', 'Parameter deleted successfully');
      } catch (error) {
        console.error('Error deleting parameter:', error);
        showAlert('danger', 'Failed to delete parameter');
      } finally {
        setIsLoading(false);
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
            <div className="mb-0">Parameters</div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <div className="card-title mb-0">Add New Parameter</div>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddParameter}>
                <div className="mb-3">
                  <label htmlFor="parameterName" className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="parameterName"
                    value={newParameter.name}
                    onChange={(e) => setNewParameter({ ...newParameter, name: e.target.value })}
                    required
                    aria-describedby="parameterNameHelp"
                  />
                  <div id="parameterNameHelp" className="form-text text-muted">Enter a descriptive name for the parameter.</div>
                </div>
                <div className="mb-3">
                  <label htmlFor="parameterType" className="form-label">Type</label>
                  <select
                    className="form-select"
                    id="parameterType"
                    value={newParameter.type}
                    onChange={(e) => setNewParameter({ ...newParameter, type: e.target.value })}
                    required
                    aria-describedby="parameterTypeHelp"
                  >
                    <option value="">Select a type</option>
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="array">Array</option>
                  </select>
                  <div id="parameterTypeHelp" className="form-text text-muted">Choose the data type for this parameter.</div>
                </div>
                <div className="mb-3">
                  <label htmlFor="parameterDescription" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="parameterDescription"
                    rows="3"
                    value={newParameter.description}
                    onChange={(e) => setNewParameter({ ...newParameter, description: e.target.value })}
                    aria-describedby="parameterDescriptionHelp"
                  />
                  <div id="parameterDescriptionHelp" className="form-text text-muted">Provide additional details about this parameter.</div>
                </div>
                <div className="mb-3">
                  <label htmlFor="parameterCategory" className="form-label">Category</label>
                  <select
                    className="form-select"
                    id="parameterCategory"
                    value={newParameter.categoryId}
                    onChange={(e) => setNewParameter({ ...newParameter, categoryId: e.target.value })}
                    required
                    aria-describedby="parameterCategoryHelp"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div id="parameterCategoryHelp" className="form-text text-muted">Choose the category this parameter belongs to.</div>
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="parameterVisibility"
                      checked={newParameter.visibility}
                      onChange={(e) => setNewParameter({ ...newParameter, visibility: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="parameterVisibility">
                      Visible to users
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  Add Parameter
                </button>
              </form>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <div className="card-title mb-0">Parameters</div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Type</th>
                      <th scope="col">Description</th>
                      <th scope="col">Category</th>
                      <th scope="col">Visible</th>
                      <th scope="col" className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parameters.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          No parameters found. Add your first parameter above.
                        </td>
                      </tr>
                    ) : (
                      parameters.map((parameter) => (
                        <tr key={parameter.id}>
                          <td>{parameter.name}</td>
                          <td>{parameter.type}</td>
                          <td>{parameter.description}</td>
                          <td>{categories.find(c => c.id === parameter.categoryId)?.name}</td>
                          <td>
                            {parameter.visibility ? '✓' : '✗'}
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-primary me-2"
                              onClick={() => {
                                setEditingParameter(parameter);
                                setShowModal(true);
                              }}
                              aria-label={`Edit ${parameter.name}`}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteParameter(parameter.id)}
                              aria-label={`Delete ${parameter.name}`}
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

      {/* Edit Parameter Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="editParameterModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header">
                <div className="modal-title" id="editParameterModalLabel">Edit Parameter</div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setEditingParameter(null);
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <form onSubmit={handleUpdateParameter}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editParameterName" className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editParameterName"
                      value={editingParameter.name}
                      onChange={(e) => setEditingParameter({ ...editingParameter, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editParameterType" className="form-label">Type</label>
                    <select
                      className="form-select"
                      id="editParameterType"
                      value={editingParameter.type}
                      onChange={(e) => setEditingParameter({ ...editingParameter, type: e.target.value })}
                      required
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="array">Array</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editParameterDescription" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="editParameterDescription"
                      rows="3"
                      value={editingParameter.description}
                      onChange={(e) => setEditingParameter({ ...editingParameter, description: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editParameterCategory" className="form-label">Category</label>
                    <select
                      className="form-select"
                      id="editParameterCategory"
                      value={editingParameter.categoryId}
                      onChange={(e) => setEditingParameter({ ...editingParameter, categoryId: e.target.value })}
                      required
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="editParameterVisibility"
                        checked={editingParameter.visibility}
                        onChange={(e) => setEditingParameter({ ...editingParameter, visibility: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="editParameterVisibility">
                        Visible to users
                      </label>
                    </div>
                  </div>
                  
                  {editingParameter.type === 'array' && (
                    <div className="mb-3">
                      <label className="form-label">Values</label>
                      <div className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          placeholder="Add a value"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleAddValue}
                        >
                          Add
                        </button>
                      </div>
                      <div className="list-group">
                        {editingParameter.values.map((value, index) => (
                          <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            {value}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveValue(index)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditingParameter(null);
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

export default Parameters; 