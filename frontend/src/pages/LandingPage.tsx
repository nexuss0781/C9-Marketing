// src/pages/LandingPage.tsx
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center p-8">
        <h1 className="text-5xl font-bold mb-4">Welcome to C9 Marketplace</h1>
        <p className="text-xl text-gray-300 mb-8">The direct way to buy and sell goods.</p>
        <div className="space-x-4">
          <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
            Sign In
          </Link>
          <Link to="/signup" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
