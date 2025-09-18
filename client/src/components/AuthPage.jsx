// frontend/src/components/AuthPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import '../App.css';

const AuthPage = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [message, setMessage] = useState('');
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  // --- Login ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/users/login', {
        email: loginEmail,
        password: loginPassword,
      });
      handleLogin(response.data.token, response.data.user);
      navigate('/');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed. Please check your credentials.');
    }
  };

  // --- Register ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/users/register', {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
      });
      setMessage('✅ Registration successful! Please log in.');
      setIsFlipped(false);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <header className="auth-header">
        <h1 className="text-center py-3">SwiftBid</h1>
      </header>

      <Container fluid className="d-flex justify-content-center align-items-center auth-container">
        <div className={`flip-card ${isFlipped ? 'is-flipped' : ''}`}>
          <div className="flip-card-inner">
            {/* --- Login Side --- */}
            <Card className="flip-card-front auth-card">
              <Card.Body>
                <Card.Title className="text-center mb-4">Login</Card.Title>
                {message && !isFlipped && <Alert variant="danger">{message}</Alert>}
                <Form onSubmit={handleLoginSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Email"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Password"
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100 mt-3">
                    Login
                  </Button>
                </Form>
                <div className="text-center mt-3">
                  <Button variant="link" onClick={() => { setIsFlipped(true); setMessage(''); }}>
                    Don’t have an account? Register here.
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* --- Register Side --- */}
            <Card className="flip-card-back auth-card">
              <Card.Body>
                <Card.Title className="text-center mb-4">Register</Card.Title>
                {message && isFlipped && <Alert variant="danger">{message}</Alert>}
                <Form onSubmit={handleRegisterSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="text"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      placeholder="Username"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="Email"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Password"
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100 mt-3">
                    Register
                  </Button>
                </Form>
                <div className="text-center mt-3">
                  <Button variant="link" onClick={() => { setIsFlipped(false); setMessage(''); }}>
                    Already have an account? Login here.
                  </Button>
                </div>
              </Card.Body>
            </Card>

          </div>
        </div>
      </Container>

      <footer className="auth-footer text-center py-3">
        <p>&copy; 2025 SwiftBid. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthPage;