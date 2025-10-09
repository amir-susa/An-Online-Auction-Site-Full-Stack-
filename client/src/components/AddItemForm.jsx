// frontend/src/components/AddItemForm.jsx

import React, { useState } from 'react';
// import axios from 'axios'; // <-- REMOVED RAW AXIOS
import API from '../api'; // <-- IMPORT CONFIGURED API INSTANCE
import { useNavigate } from 'react-router-dom';

const AddItemForm = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startingPrice, setStartingPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [endTime, setEndTime] = useState('');
    
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('startingPrice', startingPrice);
        formData.append('endTime', endTime);

        // Append one or the other, not both
        if (imageFile) {
            formData.append('image', imageFile);
        } else if (imageUrl) {
            formData.append('imageUrl', imageUrl);
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to add an item.');
                setLoading(false);
                return;
            }

            // --- CHANGE IS HERE: Use API.post instead of axios.post with hardcoded URL ---
            await API.post('/api/items', formData, {
                headers: {
                    // Note: Axios and API instance will automatically set the correct Content-Type for FormData, 
                    // but we keep the Authorization header.
                    'Authorization': `Bearer ${token}` 
                },
            });
            // --- END CHANGE ---

            setSuccessMessage('Item added successfully!');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to add item. Please try again.';
            setError(errorMessage);
            console.error('AddItemForm submission error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Add a New Auction Item</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Item Name:</label>
                    <input
                        type="text"
                        id="name"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description:</label>
                    <textarea
                        id="description"
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className="mb-3">
                    <label htmlFor="startingPrice" className="form-label">Starting Bid:</label>
                    <input
                        type="number"
                        id="startingPrice"
                        className="form-control"
                        value={startingPrice}
                        onChange={(e) => setStartingPrice(e.target.value)}
                        required
                        step="0.01"
                        min="0"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="endTime" className="form-label">Auction End Time:</label>
                    <input
                        type="datetime-local"
                        id="endTime"
                        className="form-control"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="imageFile" className="form-label">Upload Image:</label>
                    <input
                        type="file"
                        id="imageFile"
                        className="form-control"
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="imageUrl" className="form-label">Or Image URL:</label>
                    <input
                        type="text"
                        id="imageUrl"
                        className="form-control"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        disabled={!!imageFile}
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Item'}
                </button>
            </form>
            {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
    );
};

export default AddItemForm;