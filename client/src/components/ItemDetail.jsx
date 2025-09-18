import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import CountdownTimer from './CountdownTimer';
import { AuthContext } from "../contexts/AuthContext";

function ItemDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext); // Get user from AuthContext
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(null);

  const fetchItem = useCallback(async () => {
    try {
      const response = await API.get(`/api/items/${id}`);
      setItem(response.data);
    } catch (err) {
      setError('Failed to fetch item details. Please try again later.');
      console.error('Error fetching item:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setBidError(null);
    setBidSuccess(null);

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setBidError('Please enter a valid bid amount.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setBidError('You must be logged in to place a bid.');
        return;
      }

      const response = await API.post(`/api/items/${item._id}/bid`, { amount }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setItem(response.data.item); // Update item with new bid
      setBidSuccess(response.data.message);
      setBidAmount(''); // Clear input
      fetchItem(); // Re-fetch to ensure all data is fresh, including potential seller update
    } catch (err) {
      setBidError(err.response?.data?.error || 'Failed to place bid. Please try again.');
      console.error('Bid submission error:', err);
    }
  };

  if (loading) {
    return <div className="text-center mt-5 text-muted">Loading item details...</div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center mt-5">{error}</div>;
  }

  if (!item) {
    return <div className="alert alert-info text-center mt-5">Item not found.</div>;
  }

  const isAuctionOver = new Date() > new Date(item.endTime);
  // Ensure user and item.seller exist before comparison
  const isSeller = user && item.seller && user.id === item.seller._id;

  return (
    <>
      <div className="container my-5">
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="item-detail-image-container shadow-sm d-flex align-items-center justify-content-center">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="img-fluid rounded" />
              ) : (
                <div className="item-image-placeholder d-flex align-items-center justify-content-center">
                  📸
                </div>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <h2>{item.name}</h2>
            <p className="text-muted">{item.description}</p>
            {/* CORRECTED DISPLAY OF CURRENT BID AND STARTING PRICE */}
            <p>
              <strong>Current Bid:</strong> <span className="fw-bold text-primary">${item.currentBid.toFixed(2)}</span>
            </p>
            <p>
              <strong>Starting Price:</strong> <span className="fw-bold">${item.startingPrice.toFixed(2)}</span>
            </p>
            <p>
              <strong>Ends:</strong> <span className="fw-bold"><CountdownTimer endTime={item.endTime} /></span>
            </p>
            <p>
              <strong>Seller:</strong> <span className="fw-bold">{item.seller?.username || 'N/A'}</span>
            </p>

            {/* BIDDING FORM CONDITIONAL RENDERING */}
            {!user ? (
              <div className="alert alert-info mt-4">
                Please <Link to="/login">log in</Link> to place a bid.
              </div>
            ) : isAuctionOver ? (
              <div className="alert alert-danger mt-4">
                Auction has ended.
                {item.bidder && item.currentBid > item.startingPrice ? (
                    <p className="mb-0">Winner: {item.bidder?.username || 'N/A'} with a bid of ${item.currentBid.toFixed(2)}</p>
                ) : (
                    <p className="mb-0">No bids were placed on this item.</p>
                )}
              </div>
            ) : isSeller ? (
              <div className="alert alert-info mt-4">
                You are the seller of this item and cannot place a bid.
              </div>
            ) : (
              <div className="bid-section mt-4 p-4 border rounded shadow-sm bg-light">
                <h5>Place Your Bid</h5>
                <form onSubmit={handleBidSubmit}>
                  <div className="input-group mb-3">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder={`Enter bid (min $${(item.currentBid > item.startingPrice ? item.currentBid : item.startingPrice + 0.01).toFixed(2)})`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                      min={item.currentBid > item.startingPrice ? (item.currentBid + 0.01).toFixed(2) : (item.startingPrice + 0.01).toFixed(2)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Submit Bid
                  </button>
                </form>
                {bidError && <div className="alert alert-danger mt-3">{bidError}</div>}
                {bidSuccess && <div className="alert alert-success mt-3">{bidSuccess}</div>}
              </div>
            )}
            <Link to="/" className="btn btn-secondary mt-3">Back to Auction List</Link>
          </div>
        </div>
      </div>
      <footer className="custom-footer mt-auto">
        <div className="container d-flex justify-content-between flex-wrap py-4">
          <div>
            <h5>About Us</h5>
            <p className="small mb-0">
              We provide a safe and easy way to auction items online. Bid now and win!
            </p>
          </div>
          <div>
            <h5>Quick Links</h5>
            <ul className="list-unstyled small mb-0">
              <li><Link to="/" className="text-decoration-none text-muted">Home</Link></li>
              <li><Link to="/profile" className="text-decoration-none text-muted">Profile</Link></li>
              <li><Link to="/add-item" className="text-decoration-none text-muted">Add Item</Link></li>
            </ul>
          </div>
          <div>
            <h5>Contact</h5>
            <p className="small mb-0">📧 support@auction.com<br />📞 +2 512 285 2525</p>
          </div>
        </div>
        <div className="text-center small py-2 border-top">
          © {new Date().getFullYear()} Online Auction. All Rights Reserved.
        </div>
      </footer>
    </>
  );
}

export default ItemDetail;