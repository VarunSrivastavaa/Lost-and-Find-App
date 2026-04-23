import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="row justify-content-center mt-5">
            <div className="col-md-6 col-lg-4">
                <div className="card shadow-lg border-0 rounded-lg">
                    <div className="card-header bg-white pb-0 border-0">
                        <h3 className="text-center font-weight-light my-4 text-primary">Login</h3>
                    </div>
                    <div className="card-body">
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={onSubmit}>
                            <div className="form-floating mb-3">
                                <input
                                    className="form-control"
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={onChange}
                                    placeholder="name@example.com"
                                    required
                                />
                                <label>Email address</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input
                                    className="form-control"
                                    type="password"
                                    name="password"
                                    value={password}
                                    onChange={onChange}
                                    placeholder="Password"
                                    required
                                />
                                <label>Password</label>
                            </div>
                            <div className="d-grid gap-2 mt-4 mb-0">
                                <button className="btn btn-primary btn-lg" type="submit">Login</button>
                            </div>
                        </form>
                    </div>
                    <div className="card-footer text-center py-3 border-0 bg-white">
                        <div className="small">
                            <Link to="/register" className="text-decoration-none">Need an account? Sign up!</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
