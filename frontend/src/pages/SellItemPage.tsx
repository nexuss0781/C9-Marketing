// src/pages/SellItemPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';

// Define categories for the dropdown
const CATEGORIES = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Automotive', 'Home Goods', 'Other'];

export default function SellItemPage() {
    const [userPhone, setUserPhone] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        category: CATEGORIES[0], // Default to the first category
        condition: 'Used',
        price: '',
        address: '',
        photos: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user's profile to get their phone number
        api.get('/me/profile').then(res => {
            setUserPhone(res.data.phone);
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        // Form validation...
        if (Object.values(formData).some(val => val === '')) {
            setError('All fields are required.'); setSubmitting(false); return;
        }
        const photosArray = formData.photos.split(',').map(url => url.trim()).filter(url => url);
        if (photosArray.length === 0) {
            setError('Please provide at least one image URL.'); setSubmitting(false); return;
        }
        try {
            await api.post('/products', { ...formData, price: parseFloat(formData.price), photos: photosArray });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Failed to create product.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-vh-100 bg-dark text-white">
            <Header />
            <main className="container py-5">
                <div className="col-md-8 mx-auto bg-secondary p-5 rounded-3 shadow-lg">
                    <h1 className="h1 fw-bold mb-5 text-center">List a New Item</h1>
                    <form onSubmit={handleSubmit} className="vstack gap-4">
                         <div>
                            <label className="form-label">Contact Phone (from your profile)</label>
                            <input type="text" value={userPhone} readOnly
                                className="form-control-plaintext bg-dark p-3 rounded-3 text-muted"/>
                        </div>
                        <div>
                            <label className="form-label">Product Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control bg-dark text-white border-secondary"/>
                        </div>
                        <div>
                            <label className="form-label">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="form-select bg-dark text-white border-secondary">
                                {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Condition</label>
                            <select name="condition" value={formData.condition} onChange={handleChange} className="form-select bg-dark text-white border-secondary">
                                <option>Used</option>
                                <option>New</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Price ($)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-control bg-dark text-white border-secondary"/>
                        </div>
                        <div>
                            <label className="form-label">Address / Pickup Location</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-control bg-dark text-white border-secondary"/>
                        </div>
                         <div>
                            <label className="form-label">Photo URLs (comma-separated)</label>
                            <input type="text" name="photos" value={formData.photos} onChange={handleChange} className="form-control bg-dark text-white border-secondary"/>
                        </div>
                        {error && <p className="text-danger text-center">{error}</p>}
                        <button type="submit" disabled={submitting} className="w-100 btn btn-primary btn-lg">
                            {submitting ? 'Submitting...' : 'List Item'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}