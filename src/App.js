import './Assets/css/styles.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Basic from "./Pages/Basic";
import Subscribed from './Pages/Subscribed';
import Price from './Pages/Price';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import Forgot from './Pages/Forgot';
import Code from './Pages/Code';
import { useContext } from 'react';
import { AuthContext } from './Context/AuthContext'; // Adjust path as needed
import Success from './Pages/Success';
import Cancel from './Pages/Cancel';
import Inactive from './Pages/Inactive';

// Wrapper component to handle /chat/:id rendering
function ChatRoute() {
  const { user, isLoading } = useContext(AuthContext); // Get user and isLoading

  if (isLoading) {
    return;
  }

  return user && user.subscriptionStatus === "active" ? <Subscribed /> : <Basic />;
}

function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/chat" element={<Inactive />} />
          <Route path="/chat/:id" element={<ChatRoute />} />
          <Route path="/pricing" element={<Price />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<Forgot />} />
          <Route path="/verify-code" element={<Code />} />
          <Route path="/payment-success" element={<Success />} />
          <Route path="/payment-cancel" element={<Cancel />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;