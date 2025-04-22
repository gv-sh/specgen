import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Categories from './pages/Categories';
import Parameters from './pages/Parameters';
import Database from './pages/Database';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">
              <i className="bi bi-gear-fill me-2"></i>
              Admin Dashboard
            </Link>
            <button 
              className="navbar-toggler" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#navbarNav"
              aria-controls="navbarNav" 
              aria-expanded="false" 
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/categories">
                    <i className="bi bi-grid-3x3-gap-fill me-1"></i>
                    Categories
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/parameters">
                    <i className="bi bi-sliders me-1"></i>
                    Parameters
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/database">
                    <i className="bi bi-database-fill me-1"></i>
                    Database
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow-1 bg-light">
          <div className="container-fluid py-4">
            <Layout>
              <Routes>
                <Route path="/categories" element={<Categories />} />
                <Route path="/parameters" element={<Parameters />} />
                <Route path="/database" element={<Database />} />
                <Route path="/" element={
                  <div className="text-center py-5">
                    <h1 className="display-4 mb-4">Welcome to Admin Dashboard</h1>
                    <p className="lead text-muted">
                      Select a section from the navigation menu to get started.
                    </p>
                  </div>
                } />
              </Routes>
            </Layout>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-dark text-light py-3">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12 text-center">
                <p className="mb-0">
                  © {new Date().getFullYear()} SpecGen Admin. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App; 