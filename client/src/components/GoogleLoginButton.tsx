import { GoogleLogin } from '@react-oauth/google';
import api from '../api.ts'; // your axios instance

const GoogleLoginButton = () => {
  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        const { credential } = credentialResponse;
        const res = await api.post('/auth/google', { token: credential });
        localStorage.setItem('token', res.data.token);
        window.location.href = '/dashboard'; // redirect
      }}
      onError={() => {
        console.log('Login Failed');
      }}
    />
  );
};

export default GoogleLoginButton;
