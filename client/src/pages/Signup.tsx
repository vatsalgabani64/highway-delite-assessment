import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.ts';
import logoImage from '../images/logo.png';
import backgroundImage from '../images/background.png';
import './Signup.css';
import GoogleLoginButton from '../components/GoogleLoginButton.tsx';

export default function Signup() {
  const [form, setForm] = useState({ name: '', dob: '', email: '', otp: '' });
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClick = async () => {
    if (step === 'email') {
      try {
        await api.post('/auth/signup', {
          name: form.name,
          dob: form.dob,
          email: form.email,
        });
        setStep('otp');
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to send OTP');
      }
    } else {
      try {
        const res = await api.post('/auth/verify-otp', {
          email: form.email,
          otp: form.otp,
        });
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid OTP');
      }
    }
  };

  return (
    <div className="signup-container">
      {/* Left Column */}
      <div className="signup-left">
        <div className="logo">
          <img src={logoImage} alt="Logo" className="logo-image" />
          <span className="logo-text">HD</span>
        </div>
        <div className="signup-form-wrapper">
          <h1 className="title">Sign up</h1>
          <p className="subtitle">Signup to enjoy the feature of HD</p>

          {/* Floating Input: Name */}
          <div className="floating-input-wrapper">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder=" "
              className="floating-input"
              disabled={step === 'otp'}
            />
            <label className="floating-label">Your Name</label>
          </div>

          {/* Floating Input: DOB */}
          <div className="floating-input-wrapper">
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              placeholder=""
              className="floating-input"
              disabled={step === 'otp'}
            />
            <label className="floating-label">Date of Birth</label>
          </div>

          {/* Floating Input: Email */}
          <div className="floating-input-wrapper">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder=" "
              className="floating-input"
              disabled={step === 'otp'}
            />
            <label className="floating-label">Email</label>
          </div>

          {/* Floating Input: OTP (conditional) */}
          {step === 'otp' && (
            <div className="floating-input-wrapper">
              <input
                type="text"
                name="otp"
                value={form.otp}
                onChange={handleChange}
                placeholder=" "
                className="floating-input"
              />
              <label className="floating-label">OTP</label>
            </div>
          )}

          <button className="signup-button" onClick={handleClick}>
            {step === 'email' ? 'Get OTP' : 'Sign up'}
          </button>

          <GoogleLoginButton />

          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

          <p className="login-link">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>

      {/* Right Column */}
      <div className="signup-right">
        <img src={backgroundImage} alt="Background" className="signup-image" />
      </div>
    </div>
  );
}
