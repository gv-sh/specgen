import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Categories from './pages/Categories';
import Parameters from './pages/Parameters';
import Database from './pages/Database';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="admin-nav">
          <h1>Admin Dashboard</h1>
          <ul>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/parameters">Parameters</Link></li>
            <li><Link to="/database">Database</Link></li>
          </ul>
        </nav>

        <main className="admin-content">
          <Routes>
            <Route path="/categories" element={<Categories />} />
            <Route path="/parameters" element={<Parameters />} />
            <Route path="/database" element={<Database />} />
            <Route path="/" element={<h2>Welcome to Admin Dashboard</h2>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 