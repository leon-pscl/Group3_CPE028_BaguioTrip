import React, { useState } from 'react';
import { setAuth, apiRequest } from './auth.js';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(mode) {
    setError('');
    setLoading(true);
    try {
      const data = await apiRequest(`/api/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setAuth(data.token, data.user);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-hero">
          <div className="kicker">City of Pines</div>
          <h1>Baguio Trip</h1>
        </div>
        <p className="login-intro">Sign in to sync your trips across devices.</p>
        <input
          className="login-input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        {error && <p className="login-error">{error}</p>}
        <div className="login-actions">
          <button className="login-btn" onClick={() => handleSubmit('login')} disabled={loading}>
            {loading ? 'Please wait\u2026' : 'Sign In'}
          </button>
          <button className="login-btn secondary" onClick={() => handleSubmit('register')} disabled={loading}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
