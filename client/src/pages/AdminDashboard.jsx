// frontend/src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAdminData = async () => {
            setLoading(true);
            try {
                // Fetch all users
                const usersResponse = await axios.get('http://localhost:3000/api/admin/users', {
                    headers: { 'x-auth-token': token }
                });
                setUsers(usersResponse.data);

                // Fetch all items
                const itemsResponse = await axios.get('http://localhost:3000/api/admin/items', {
                    headers: { 'x-auth-token': token }
                });
                setItems(itemsResponse.data);

                setLoading(false);
            } catch (err) {
                setError('Failed to fetch admin data.');
                setLoading(false);
                console.error('Admin dashboard fetch error:', err);
            }
        };
        fetchAdminData();
    }, [token]);

    if (loading) return <div>Loading admin dashboard...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-container">
            <h2>Admin Dashboard</h2>
            <div className="admin-section">
                <h3>All Users</h3>
                <ul>
                    {users.map(user => (
                        <li key={user._id}>
                            {user.username} - {user.email} ({user.role})
                        </li>
                    ))}
                </ul>
            </div>
            <div className="admin-section">
                <h3>All Auction Items</h3>
                <ul>
                    {items.map(item => (
                        <li key={item._id}>
                            <Link to={`/item/${item._id}`}>{item.name}</Link> - Current Bid: ${item.currentBid}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboard;