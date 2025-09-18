// frontend/src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Assuming your AuthContext exists

const Profile = () => {
    // You need to ensure useAuth provides 'token'.
    // The 'user' variable is not strictly needed here since the backend call
    // to '/api/users/me' will get the user's specific data.
    const { token } = useAuth();
    
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Check if a token exists before making the API call
                if (!token) {
                    setLoading(false);
                    setError("You must be logged in to view this page.");
                    return;
                }

                const response = await axios.get('/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setProfileData(response.data);
            } catch (err) {
                console.error("Error fetching profile data:", err);
                setError('Failed to fetch profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [token]); // The dependency array ensures this runs when the token changes

    if (loading) {
        return <div className="loading-message">Loading profile...</div>;
    }
    if (error) {
        return <div className="error-message">{error}</div>;
    }
    if (!profileData) {
        return <div className="no-data-message">No profile data available.</div>;
    }

    return (
        <div className="profile-container">
            <h2>User Profile</h2>
            <p>Email: {profileData.email}</p>

            <div className="profile-sections">
                {/* User's Auction Items */}
                <div className="user-items">
                    <h3>Your Items</h3>
                    {profileData.items && profileData.items.length > 0 ? (
                        <ul>
                            {profileData.items.map(item => (
                                <li key={item._id}>
                                    <h4>{item.name}</h4>
                                    <p>Starting Price: ${item.startingPrice}</p>
                                    <p>Current Bid: ${item.currentBid || 'No bids yet'}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>You have not listed any items for auction.</p>
                    )}
                </div>

                {/* User's Bid History */}
                <div className="user-bids">
                    <h3>Your Bids</h3>
                    {profileData.bids && profileData.bids.length > 0 ? (
                        <ul>
                            {profileData.bids.map(bid => (
                                <li key={bid._id} className={bid.isHighest ? 'highest-bid' : ''}>
                                    <h4>Bid on: {bid.item.name}</h4>
                                    <p>Your Bid: ${bid.amount}</p>
                                    {bid.isHighest && <p>You are the current highest bidder! 🎉</p>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>You have not placed any bids.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;