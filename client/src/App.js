import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Signup from './pages/Signup.tsx';
// import Otp from './pages/Otp.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Login from './pages/Login.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup/>}></Route>
        <Route path="/login" element={<Login/>}></Route>
        {/* <Route path="/otp" element={<Otp/>}></Route> */}
        <Route path="/dashboard" element={<Dashboard/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
