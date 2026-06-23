import React from 'react';
import { Link } from 'react-router-dom';

export default function SignUp() {
  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card " style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-body p-5">
          <div className="text-center mb-3">
            <Link to="/admin" className="mb-4 d-inline-block">
              <img src="/logo-estore.png" alt="PC eStore Logo" style={{ height: '40px', objectFit: 'contain' }} />
            </Link>
            <h1 className="card-title mb-5 h5">Create your account</h1>
          </div>

          <form className="needs-validation mt-3" noValidate>
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label">Full name</label>
              <input id="fullName" type="text" className="form-control" placeholder="Jane Doe" required />
              <div className="invalid-feedback">Please enter your name.</div>
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input id="email" type="email" className="form-control" placeholder="name@example.com" required />
              <div className="invalid-feedback">Please enter a valid email.</div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input id="password" type="password" className="form-control" placeholder="Create a password" required minLength="6" />
              <div className="invalid-feedback">Please provide a password (min 6 characters).</div>
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
              <input id="confirmPassword" type="password" className="form-control" placeholder="Repeat password" required />
              <div className="invalid-feedback">Passwords must match.</div>
            </div>

            <div className="mb-3 form-check">
              <input id="terms" className="form-check-input" type="checkbox" required />
              <label className="form-check-label small" htmlFor="terms">I agree to the <a href="#!" className="text-decoration-none">terms and privacy</a></label>
              <div className="invalid-feedback">You must agree before continuing.</div>
            </div>

            <button className="btn btn-primary w-100" type="submit">Sign up</button>
          </form>

          <div className="text-center mt-3 small text-muted">
            Already have an account? <Link to="/admin/signin" className="link-primary">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
