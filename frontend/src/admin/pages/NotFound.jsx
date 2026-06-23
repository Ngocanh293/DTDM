import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="text-center">
          <div className="mb-4">
            <Link to="/admin" className="d-inline-block mb-4">
              <img src="/logo-estore.png" alt="PC eStore Logo" style={{ height: '40px', objectFit: 'contain' }} />
            </Link>
          </div>

          <h1 className="display-1 fw-bold text-primary mb-2">404</h1>
          <h2 className="card-title h4 mb-3">Page Not Found</h2>
          <p className="text-muted mb-4">Sorry, the page you're looking for doesn't exist or has been moved.</p>

          <Link to="/admin" className="btn btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
