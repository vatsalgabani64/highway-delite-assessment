import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.ts';
import logoImage from '../images/logo.png';
import backgroundImage from '../images/background.png';
import './Login.css';
import eyeOffSvg from '../images/eye-off.svg';
import GoogleLoginButton from '../components/GoogleLoginButton.tsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState('');
  const [showOtp, setShowOtp] = useState(true);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const navigate = useNavigate();

  const handleGetOtp = async () => {
    try {
      await api.post('/auth/login', { email });
      setStep('otp');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/verify-login-otp', { email, otp });
      if (keepLoggedIn) {
        localStorage.setItem('token', res.data.token); // persists even after tab close
      } else {
        sessionStorage.setItem('token', res.data.token); // clears after tab/browser close
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-left">
        <div className="logo">
          <img src={logoImage} alt="Logo" className="logo-image" />
          <span className="logo-text">HD</span>
        </div>

        <div className="signin-form-wrapper">
          <h1 className="title">Sign in</h1>
          <p className="subtitle">Please login to continue to your account.</p>

          <div className="floating-input-wrapper">
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="floating-input"
              disabled={step === 'otp'}
            />
            <label className="floating-label">Email</label>
          </div>

          {step === 'otp' && (
            <div className="floating-input-wrapper">
              <input
                type={showOtp ? 'text' : 'password'}
                placeholder=" "
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="floating-input"
              />
              <label className="floating-label">OTP</label>
              <button
                className="otp-visibility"
                onClick={() => setShowOtp(!showOtp)}
              >
                {showOtp ? <img src={eyeOffSvg} alt="Delete" className="delete-icon" /> : '👁️'}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <p className="resend-otp" onClick={handleGetOtp}>
              Resend OTP
            </p>
          )}

          <label className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={keepLoggedIn}
              onChange={() => setKeepLoggedIn(!keepLoggedIn)}
            />
            Keep me logged in
          </label>

          <button
            className="signin-button"
            onClick={step === 'email' ? handleGetOtp : handleLogin}
          >
            {step === 'email' ? 'Get OTP' : 'Sign in'}
          </button>

          <GoogleLoginButton />
          {error && <p className="error-text">{error}</p>}
          
          <p className="signin-footer">
            Need an account? <a href="/">Create one</a>
          </p>
        </div>
      </div>

      <div className="signin-right">
        <img src={backgroundImage} alt="Background" className="signin-image" />
      </div>
    </div>
  );
}
