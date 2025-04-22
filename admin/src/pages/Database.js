import React, { useState, useRef } from 'react';
import axios from 'axios';
import config from '../config';
import '../styles/Database.css';
import { 
  FiDownload, 
  FiUpload, 
  FiTrash2, 
  FiAlertTriangle,
  FiX,
  FiCheck,
  FiDatabase
} from 'react-icons/fi';

function Database() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showRestoreWarning, setShowRestoreWarning] = useState(false);
  const [showResetWarning, setShowResetWarning] = useState(false);
  const fileInputRef = useRef(null);

  const handleDownload = async () => {
    try {
      setMessage('');
      setError('');
      console.log('Initiating database download...');
      
      const response = await axios.get(`${config.API_URL}/api/database/download`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Download response received:', response);
      
      if (response.status !== 200) {
        throw new Error(`Server returned status ${response.status}`);
      }

      // Create a JSON string from the response data
      const jsonString = JSON.stringify(response.data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'database.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setMessage('Database downloaded successfully');
    } catch (err) {
      console.error('Download error:', err);
      setError(err.response?.data?.error || 'Failed to download database');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage('');
      setError('');
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      setMessage('');
      setError('');
      
      const formData = new FormData();
      formData.append('file', selectedFile);

      await axios.post(`${config.API_URL}/api/database/restore`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('Database restored successfully');
      setSelectedFile(null);
      setShowRestoreWarning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Restore error:', err);
      setError(err.response?.data?.error || 'Failed to restore database');
    }
  };

  const handleReset = async () => {
    try {
      setMessage('');
      setError('');

      await axios.post(`${config.API_URL}/api/database/reset`);

      setMessage('Database reset successfully');
      setShowResetWarning(false);
    } catch (err) {
      console.error('Reset error:', err);
      setError(err.response?.data?.error || 'Failed to reset database');
    }
  };

  return (
    <div className="database-container">
      <div className="page-header">
        <FiDatabase className="page-icon" />
        <h2 className="page-title">Database Management</h2>
      </div>
      
      <div className="database-grid">
        <div className="database-section">
          <div className="section-header">
            <div className="section-title">
              <h3>Download Database</h3>
              <FiDownload className="section-icon" />
            </div>
            <p className="help-text">Create a backup of your current database configuration.</p>
          </div>
          <div className="section-content">
            <button onClick={handleDownload} className="button-primary">
              <FiDownload /> Download Database
            </button>
          </div>
        </div>

        <div className="database-section">
          <div className="section-header">
            <div className="section-title">
              <h3>Restore Database</h3>
              <FiUpload className="section-icon" />
            </div>
            <p className="help-text">Restore your database from a previously created backup file.</p>
          </div>
          <div className="section-content">
            <div className="file-input-container">
              <div className="file-input-wrapper">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="file-label">
                  {selectedFile ? selectedFile.name : 'Choose backup file...'}
                </label>
              </div>
              <button 
                onClick={() => setShowRestoreWarning(true)}
                disabled={!selectedFile}
                className={`button-secondary ${!selectedFile ? 'disabled' : ''}`}
              >
                <FiUpload /> Restore
              </button>
            </div>
          </div>
        </div>

        <div className="database-section danger-section">
          <div className="section-header">
            <div className="section-title">
              <h3>Reset Database</h3>
              <FiTrash2 className="section-icon" />
            </div>
            <p className="help-text warning-text">
              <FiAlertTriangle className="warning-icon" />
              This action will permanently delete all categories and parameters.
            </p>
          </div>
          <div className="section-content">
            <button 
              onClick={() => setShowResetWarning(true)}
              className="button-danger"
            >
              <FiTrash2 /> Reset Database
            </button>
          </div>
        </div>
      </div>

      {(message || error) && (
        <div className="message-container">
          {message && (
            <div className="success-message">
              <FiCheck className="message-icon" /> {message}
            </div>
          )}
          {error && (
            <div className="error-message">
              <FiAlertTriangle className="message-icon" /> {error}
            </div>
          )}
        </div>
      )}

      {showRestoreWarning && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <FiAlertTriangle className="warning-icon" />
              <h3>Confirm Database Restore</h3>
            </div>
            <p>Are you sure you want to restore the database? This will overwrite all existing data.</p>
            <div className="modal-buttons">
              <button onClick={() => setShowRestoreWarning(false)} className="button-secondary">
                <FiX /> Cancel
              </button>
              <button onClick={handleRestore} className="button-danger">
                <FiCheck /> Yes, Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetWarning && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <FiAlertTriangle className="warning-icon" />
              <h3>Confirm Database Reset</h3>
            </div>
            <p>Are you sure you want to reset the database? This will delete all categories and parameters.</p>
            <div className="modal-buttons">
              <button onClick={() => setShowResetWarning(false)} className="button-secondary">
                <FiX /> Cancel
              </button>
              <button onClick={handleReset} className="button-danger">
                <FiCheck /> Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Database; 