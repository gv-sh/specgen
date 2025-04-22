import React, { useState, useRef } from 'react';
import axios from 'axios';
import config from '../config';

function Database() {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const showAlertMessage = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
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
      
      showAlertMessage('success', 'Database downloaded successfully');
    } catch (err) {
      console.error('Download error:', err);
      showAlertMessage('danger', err.response?.data?.error || 'Failed to download database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      showAlertMessage('danger', 'Please select a file first');
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      await axios.post(`${config.API_URL}/api/database/restore`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showAlertMessage('success', 'Database restored successfully');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Restore error:', err);
      showAlertMessage('danger', err.response?.data?.error || 'Failed to restore database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsLoading(true);
      await axios.post(`${config.API_URL}/api/database/reset`);
      showAlertMessage('success', 'Database reset successfully');
    } catch (err) {
      console.error('Reset error:', err);
      showAlertMessage('danger', err.response?.data?.error || 'Failed to reset database');
    } finally {
      setIsLoading(false);
    }
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
            <div className="mb-0">Database Management</div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <div className="card-title mb-0">Download Database</div>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">Download a backup of the current database.</p>
              <button
                className="btn btn-primary"
                onClick={handleDownload}
                disabled={isLoading}
                aria-label="Download database"
              >
                {isLoading ? 'Downloading...' : 'Download Database'}
              </button>
            </div>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <div className="card-title mb-0">Restore Database</div>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">Restore the database from a backup file.</p>
              <div className="mb-3">
                <input
                  type="file"
                  className="form-control"
                  accept=".json"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                  aria-label="Select database file"
                />
              </div>
              <button
                className="btn btn-warning"
                onClick={() => {
                  setShowRestoreModal(true);
                }}
                disabled={!selectedFile || isLoading}
                aria-label="Restore database"
              >
                {isLoading ? 'Restoring...' : 'Restore Database'}
              </button>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <div className="card-title mb-0">Reset Database</div>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">Reset the database to its initial state. This action cannot be undone.</p>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setShowResetModal(true);
                }}
                disabled={isLoading}
                aria-label="Reset database"
              >
                {isLoading ? 'Resetting...' : 'Reset Database'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="restoreModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header">
                <div className="modal-title" id="restoreModalLabel">Confirm Restore</div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRestoreModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to restore the database from the selected file? This will overwrite all current data.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRestoreModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => {
                    setShowRestoreModal(false);
                    handleRestore();
                  }}
                >
                  Restore
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="resetModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header">
                <div className="modal-title" id="resetModalLabel">Confirm Reset</div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowResetModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to reset the database? This will delete all data and cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowResetModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    setShowResetModal(false);
                    handleReset();
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </>
  );
}

export default Database; 