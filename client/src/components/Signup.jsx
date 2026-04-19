
import React, { useState } from 'react';
import plantImage from '../assets/plants.png';
import { ArrowLeft } from 'lucide-react';
import googleIcon from '../assets/google.png';
import appleIcon from '../assets/apple.png';
import { useNavigate, Link } from 'react-router-dom';
import Axios from 'axios';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('store1');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const createUser = () => {
    Axios.post('http://localhost:3002/signup', {
      Email: email,
      Name: name,
      Password: password,
      role: role
    })
      .then(() => {
        setSuccessMessage('Account created successfully! Redirecting to login...');
        // Clear form
        setEmail('');
        setName('');
        setPassword('');
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      })
      .catch((err) => {
        console.error(err);
        setSuccessMessage(`Signup failed. Please try again.${err}`);
      });
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      <div className="w-full md:w-1/2 flex justify-center items-center bg-white px-6 py-8">
        <div className="w-full max-w-sm">
          <div className="relative mb-6 flex items-center justify-center">
  {/* Back Arrow */}
  <button
    onClick={() => navigate(-1)}
    className="absolute left-0 text-gray-700 hover:text-black flex items-center"
  >
    <ArrowLeft size={26} />
  </button>

</div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Get Started Now</h2>
          <p className="text-sm font-bold text-gray-600 mb-4">
            Enter your credentials to create a new account
          </p>

          {successMessage && (
            <div className="bg-green-100 text-green-800 font-semibold px-4 py-2 rounded mb-4 text-sm">
              {successMessage}
            </div>
          )}

          <label className="text-sm font-bold mb-1 block">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="text-sm font-bold mb-1 block">Email address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="text-sm font-bold mb-1 block">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="text-sm font-bold mb-1 block">Account Role</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4 bg-white text-sm font-bold"
          >
            <option value="admin">Global Administrator</option>
            <option value="store1">Store 1 Manager</option>
            <option value="store2">Store 2 Manager</option>
            <option value="store3">Store 3 Manager</option>
            <option value="store4">Store 4 Manager</option>
          </select>

          <label className="text-sm mb-4 block font-bold">
            <input type="checkbox" className="mr-2" />
            Remember for 30 days
          </label>

          <button
            className="bg-green-700 text-white w-full py-2 rounded hover:bg-green-800 mb-3 font-semibold"
            onClick={createUser}
          >
            Sign Up
          </button>

          <div className="flex items-center my-3">
            <hr className="flex-grow border-gray-300" />
            <span className="px-3 text-gray-500">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-2 font-bold">
            <button className="w-full py-2 rounded border flex items-center justify-center gap-2">
              <img src={googleIcon} alt="Google" className="w-5 h-5" />
              Signup with Google
            </button>
            <button className="w-full py-2 rounded border flex items-center justify-center gap-2">
              <img src={appleIcon} alt="Apple" className="w-5 h-5" />
              Signup with Apple
            </button>
          </div>

          <p className="text-sm font-bold text-center mt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-bold">
              Login
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden md:flex w-1/2 items-center justify-end p-4">
        <img
          src={plantImage}
          alt="plant"
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
    </div>
  );
};

export default Signup;
