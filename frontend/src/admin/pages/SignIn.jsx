import React from 'react';
import { Link } from 'react-router-dom';

export default function SignIn() {
  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card " style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-body p-5">
          <div className="text-center mb-3">
            <Link to="/admin" className="mb-4 d-inline-block">
              <img src="/logo-estore.png" alt="PC eStore Logo" style={{ height: '40px', objectFit: 'contain' }} />
            </Link>
            <h1 className="card-title mb-5 h5">Sign in to your account</h1>
          </div>

          <form className="needs-validation mt-3" noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input id="email" type="email" className="form-control" placeholder="name@example.com" required autoFocus />
              <div className="invalid-feedback">Please enter a valid email.</div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label d-flex justify-content-between">
                <span>Password</span>
                <a href="#!" className="small link-primary">Forgot Password?</a>
              </label>
              <input id="password" type="password" className="form-control" placeholder="Password" required minLength="6" />
              <div className="invalid-feedback">Please provide a password (min 6 characters).</div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input id="remember" className="form-check-input" type="checkbox" />
                <label className="form-check-label small" htmlFor="remember">Remember me</label>
              </div>
            </div>

            <button className="btn btn-primary w-100" type="submit">Sign in</button>
          </form>

          <div className="text-center mt-3 small text-muted">
            Don't have an account? <Link to="/admin/signup" className="link-primary">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
