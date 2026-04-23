import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Dashboard = () => {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        itemName: '',
        description: '',
        type: 'Lost',
        location: '',
        date: '',
        contactInfo: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await api.get('/items');
                setItems(res.data);
                
                // Get current user data from token payload roughly (or could fetch from a /me endpoint)
                // For simplicity, we decode JWT manually or assume user info is available.
                // Let's just fetch it during login and store in state, or simply rely on ownership checks.
                // Best is to have a /auth endpoint to get user, but for now we'll just parse the JWT.
                const token = localStorage.getItem('token');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUser(payload.user);
                }
            } catch (err) {
                console.error(err);
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };
        fetchItems();
    }, [navigate]);

    const { itemName, description, type, location, date, contactInfo } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            if (editingId) {
                const res = await api.put(`/items/${editingId}`, formData);
                setItems(items.map(item => item._id === editingId ? res.data : item));
                setEditingId(null);
            } else {
                const res = await api.post('/items', formData);
                setItems([res.data, ...items]);
            }
            setFormData({
                itemName: '',
                description: '',
                type: 'Lost',
                location: '',
                date: '',
                contactInfo: ''
            });
        } catch (err) {
            console.error(err);
            alert('Error saving item');
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setFormData({
            itemName: item.itemName,
            description: item.description,
            type: item.type,
            location: item.location,
            date: item.date ? item.date.substring(0, 10) : '',
            contactInfo: item.contactInfo
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`/items/${id}`);
                setItems(items.filter(item => item._id !== id));
            } catch (err) {
                console.error(err);
                alert('Error deleting item');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const filteredItems = items.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Dashboard</h2>
                <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
            </div>

            <div className="row">
                <div className="col-lg-4 mb-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white pb-0 border-0">
                            <h4 className="card-title text-primary">{editingId ? 'Edit Item' : 'Report Item'}</h4>
                        </div>
                        <div className="card-body">
                            <form onSubmit={onSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Item Name</label>
                                    <input type="text" className="form-control" name="itemName" value={itemName} onChange={onChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Type</label>
                                    <select className="form-select" name="type" value={type} onChange={onChange}>
                                        <option value="Lost">Lost</option>
                                        <option value="Found">Found</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" name="description" value={description} onChange={onChange} required rows="3"></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Location</label>
                                    <input type="text" className="form-control" name="location" value={location} onChange={onChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Date</label>
                                    <input type="date" className="form-control" name="date" value={date} onChange={onChange} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contact Info</label>
                                    <input type="text" className="form-control" name="contactInfo" value={contactInfo} onChange={onChange} required />
                                </div>
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary">{editingId ? 'Update Item' : 'Add Item'}</button>
                                    {editingId && (
                                        <button type="button" className="btn btn-secondary" onClick={() => {
                                            setEditingId(null);
                                            setFormData({ itemName: '', description: '', type: 'Lost', location: '', date: '', contactInfo: '' });
                                        }}>Cancel</button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-body">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control form-control-lg bg-light border-0"
                                    placeholder="Search items by name, description, or location..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        {filteredItems.map(item => (
                            <div key={item._id} className="col-md-6">
                                <div className={`card h-100 shadow-sm border-0 border-top border-4 ${item.type === 'Lost' ? 'border-danger' : 'border-success'}`}>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h5 className="card-title fw-bold mb-0">{item.itemName}</h5>
                                            <span className={`badge ${item.type === 'Lost' ? 'bg-danger' : 'bg-success'}`}>{item.type}</span>
                                        </div>
                                        <p className="card-text text-muted small mb-3">{item.description}</p>
                                        <ul className="list-unstyled small mb-3">
                                            <li><strong>Location:</strong> {item.location}</li>
                                            <li><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</li>
                                            <li><strong>Contact:</strong> {item.contactInfo}</li>
                                        </ul>
                                    </div>
                                    <div className="card-footer bg-white border-0 pt-0">
                                        {user && (item.user?._id === user.id || item.user === user.id) && (
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(item)}>Edit</button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item._id)}>Delete</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredItems.length === 0 && (
                            <div className="col-12 text-center py-5 text-muted">
                                <h5>No items found.</h5>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
