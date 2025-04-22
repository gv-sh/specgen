import React, { useState, useRef } from 'react';
import axios from 'axios';
import config from '../config';
import '../styles/Database.css';

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
      <div className="database-section">
        <h3>Download Database</h3>
        <button onClick={handleDownload}>Download Database</button>
        <p className="help-text">Download a backup of the current database as a JSON file.</p>
      </div>

      <div className="database-section">
        <h3>Restore Database</h3>
        <div className="file-input-container">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
          />
          <button 
            onClick={() => setShowRestoreWarning(true)}
            disabled={!selectedFile}
            className={!selectedFile ? 'disabled' : ''}
          >
            Restore Database
          </button>
        </div>
        <p className="help-text">Select a previously downloaded database JSON file to restore.</p>
      </div>

      <div className="database-section">
        <h3>Reset Database</h3>
        <button 
          onClick={() => setShowResetWarning(true)}
          className="button-danger"
        >
          Reset Database
        </button>
        <p className="help-text warning-text">Warning: This will delete all categories and parameters.</p>
      </div>

      {showRestoreWarning && (
        <div className="modal">
          <div className="modal-content">
            <h3>Warning</h3>
            <p>Are you sure you want to restore the database? This will overwrite all existing data.</p>
            <div className="modal-buttons">
              <button onClick={handleRestore} className="button-danger">Yes, Restore</button>
              <button onClick={() => setShowRestoreWarning(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showResetWarning && (
        <div className="modal">
          <div className="modal-content">
            <h3>Warning</h3>
            <p>Are you sure you want to reset the database? This will delete all categories and parameters.</p>
            <div className="modal-buttons">
              <button onClick={handleReset} className="button-danger">Yes, Reset</button>
              <button onClick={() => setShowResetWarning(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default Database; 