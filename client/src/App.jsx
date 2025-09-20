// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import AuctionList from './components/AuctionList';
import AddItemForm from './components/AddItemForm';
import ItemDetail from './components/ItemDetail';
import Profile from './pages/Profile';
import AuthPage from './components/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './assets/Logo';

// Import React-Bootstrap components
import { Navbar, Nav, Container, Button } from 'react-bootstrap';


// PrivateRoute for authenticated users
const PrivateRoute = ({ children }) => {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? children : <Navigate to="/login" />;
};

// AdminRoute for admin users
const AdminRoute = ({ children }) => {
    const { user, isLoggedIn } = useAuth();
    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }
    return user?.role === 'admin' ? children : <Navigate to="/" />;
};

function MainApp() {
    const { isLoggedIn, handleLogout, user } = useAuth();

    return (
        <div className="App">
            <Navbar bg="light" expand="lg" className="mb-4">
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        {/* Use the logo image you saved, e.g., 'swiftbid-logo.png' */}
                        <img
                            src={logo} // Make sure this path matches where you save your logo!
                            width="45"
                            height="45"
                            className="d-inline-block align-top"
                            alt="SwiftBid Logo"
                        />
                        <span className="ms-2">SwiftBid</span> {/* Updated title */}
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            {isLoggedIn ? (
                                <>
                                    <Nav.Link as={Link} to="/">Home</Nav.Link>
                                    <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                                    <Nav.Link as={Link} to="/add-item">Add Item</Nav.Link>
                                    {user?.role === 'admin' && (
                                        <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
                                    )}
                                    <Button variant="outline-primary" onClick={handleLogout} className="ms-2">Logout</Button>
                                </>
                            ) : (
                                <>
                                    <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                    <Nav.Link as={Link} to="/register">Register</Nav.Link>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container>
                <Routes>
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/register" element={<AuthPage />} />
                    <Route path="/" element={isLoggedIn ? <AuctionList /> : <Navigate to="/login" />} />
                    <Route path="/item/:id" element={<ItemDetail />} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/add-item" element={<PrivateRoute><AddItemForm /></PrivateRoute>} />
                    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                </Routes>
            </Container>
        </div>
    );
}

const App = () => (
    <Router>
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    </Router>
);

export default App;