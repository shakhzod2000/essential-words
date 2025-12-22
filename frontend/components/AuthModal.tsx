'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
        onClose();
      } else {
        if (password !== confirmPassword) {
          setErrors({ password: 'Passwords do not match' });
          setLoading(false);
          return;
        }
        await register(username, email, password);
        onClose();
      }
    } catch (err: any) {
      const responseData = err.response?.data;

      // Handle field-specific errors from DRF serializer
      if (responseData && typeof responseData === 'object') {
        const fieldErrors: {[key: string]: string} = {};

        // DRF returns errors as {field: [error1, error2]} or {field: "error"}
        Object.keys(responseData).forEach(key => {
          const errorValue = responseData[key];
          if (Array.isArray(errorValue)) {
            fieldErrors[key] = errorValue[0]; // Take first error
          } else if (typeof errorValue === 'string') {
            fieldErrors[key] = errorValue;
          }
        });

        setErrors(fieldErrors);
      } else {
        // Fallback to general error
        setErrors({ general: 'Authentication failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth login endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login/google-oauth2/`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          padding: '40px',
          borderRadius: '10px',
          width: '90%',
          maxWidth: '450px',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#333',
          }}
        >
          ×
        </button>

        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>

        {errors.general && (
          <div
            style={{
              background: '#fee',
              color: '#c33',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '14px',
            }}
          >
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: errors.username ? '8px' : '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: errors.username ? '1px solid #c33' : '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
              }}
            />
            {errors.username && (
              <div style={{ color: '#c33', fontSize: '13px', marginTop: '5px', marginBottom: '12px' }}>
                {errors.username}
              </div>
            )}
          </div>

          {!isLogin && (
            <div style={{ marginBottom: errors.email ? '8px' : '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.email ? '1px solid #c33' : '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px',
                }}
              />
              {errors.email && (
                <div style={{ color: '#c33', fontSize: '13px', marginTop: '5px', marginBottom: '12px' }}>
                  {errors.email}
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: errors.password ? '8px' : '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: errors.password ? '1px solid #c33' : '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
              }}
            />
            {errors.password && (
              <div style={{ color: '#c33', fontSize: '13px', marginTop: '5px', marginBottom: '12px' }}>
                {errors.password}
              </div>
            )}
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px',
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#3498db',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: '15px',
            }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '20px 0', color: '#666' }}>
          <span>OR</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '12px',
            background: '#fff',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#3498db',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
