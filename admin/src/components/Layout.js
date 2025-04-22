import React from 'react';

function Layout({ children }) {
  return (
    <div className="row justify-content-center">
      <div className="col-12" style={{ maxWidth: '800px' }}>
        {children}
      </div>
    </div>
  );
}

export default Layout; 