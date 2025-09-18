import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import CountdownTimer from './CountdownTimer';

function AuctionList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await API.get('/api/items');
        setItems(response.data);
      } catch (err) {
        setError('Failed to fetch auction items. Please check if the server is running and the API endpoint is correct.');
        console.error('Error fetching auction items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handlePlaceBidClick = (e, itemId) => {
    e.preventDefault();
    navigate(`/item/${itemId}`);
  };

  if (loading) {
    return <div className="text-center mt-5 text-muted">Loading auction items...</div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center mt-5">{error}</div>;
  }

  return (
    <>
      <div className="auction-list-container py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Live Auctions</h2>
            <Link to="/add-item" className="btn btn-success">
              Add New Item
            </Link>
          </div>
          <div className="d-grid gap-4">
            {items.length === 0 ? (
              <p className="text-center text-muted">
                No auction items available yet. Be the first to add one! 🚀
              </p>
            ) : (
              items.map((item) => (
                <Link to={`/item/${item._id}`} key={item._id} className="text-decoration-none text-dark">
                  <div className="auction-item-display-card p-4 shadow-sm rounded-lg">
                    <div className="row g-4 align-items-center">
                      <div className="col-md-8">
                        <h5 className="mb-1"><strong>Item Name:</strong> {item.name}</h5>
                        <p className="mb-1"><strong>Description:</strong> {item.description}</p>
                        <p className="fw-bold mb-1">
                          <strong>Starting Price:</strong> ${item.startingPrice.toFixed(2)}
                        </p>
                        {item.currentBid > item.startingPrice && (
                           <p className="fw-bold text-primary mb-1">
                             <strong>Current Bid:</strong> ${item.currentBid.toFixed(2)}
                           </p>
                        )}
                        <p className="small mb-2">
                          <strong>Time Left:</strong> <CountdownTimer endTime={item.endTime} />
                        </p>
                         {item.seller?.username && (
                           <p className="small text-muted mb-0">
                             <strong>Seller:</strong> {item.seller.username}
                           </p>
                         )}
                      </div>
                      <div className="col-md-4 d-flex flex-column align-items-center justify-content-center">
                        <div className="auction-item-image-lg-wrapper border rounded overflow-hidden shadow-sm mb-3">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="img-fluid" />
                          ) : (
                            <div className="item-image-placeholder-large d-flex align-items-center justify-content-center bg-light text-muted">
                              No Image
                            </div>
                          )}
                        </div>
                        <button
                          className="btn btn-primary w-100"
                          onClick={(e) => handlePlaceBidClick(e, item._id)}
                        >
                          Place Bid
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
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

export default AuctionList;