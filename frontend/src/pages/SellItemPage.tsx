// src/pages/SellItemPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';

export default function SellItemPage() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    condition: 'Used', // Default value
    price: '',
    address: '',
    photos: '', // Will hold a comma-separated string of URLs
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (Object.values(formData).some(val => val === '')) {
        setError('All fields are required.');
        setSubmitting(false);
        return;
    }

    // Convert comma-separated photo URLs to an array
    const photosArray = formData.photos.split(',').map(url => url.trim()).filter(url => url);
    if (photosArray.length === 0) {
        setError('Please provide at least one image URL.');
        setSubmitting(false);
        return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      photos: photosArray,
    };

    try {
      await api.post('/products', productData);
      navigate('/dashboard'); // Redirect to dashboard on success
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to create product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-center">List a New Item</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full mt-1 p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange}
                placeholder="e.g., Electronics, Furniture"
                className="w-full mt-1 p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Condition</label>
              <select name="condition" value={formData.condition} onChange={handleChange}
                className="w-full mt-1 p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500">
                <option>Used</option>
                <option>New</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Price ($)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange}
                className="w-full mt-1 p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Address / Pickup Location</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange}
                className="w-full mt-1 p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-300">Photo URLs (comma-separated)</label>
              <input type="text" name="photos" value={formData.photos} onChange={handleChange}
                placeholder="https://.../image1.jpg, https://.../image2.jpg"
                className="w-full mt-1 p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" disabled={submitting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold disabled:bg-indigo-400">
              {submitting ? 'Submitting...' : 'List Item'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
