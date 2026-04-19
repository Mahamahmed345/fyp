// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import plantImage from '../assets/plants.png';
// import { ArrowLeft } from 'lucide-react';
// import googleIcon from '../assets/google.png';
// import appleIcon from '../assets/apple.png';
// import Axios from 'axios';
// import { useAuth } from "../context/AuthContext";

// const Login = () => {
//   const { setUser } = useAuth(); // ✅ use AuthContext
//   const [loginEmail, setLoginEmail] = useState('');
//   const [loginPassword, setLoginPassword] = useState('');
//   const [loginError, setLoginError] = useState('');
//   const navigate = useNavigate();

//   const loginUser = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await Axios.post('http://localhost:3002/login', {
//         LoginEmail: loginEmail,
//         LoginPassword: loginPassword,
//       });
      
//       const data = response.data;
      

//       if (data.token && data.user) {
//         // ✅ Save token for API calls
//         localStorage.setItem('token', data.token);

//         // ✅ Save user in React Context
//         setUser(data.user);

//         // Clear form
//         setLoginEmail('');
//         setLoginPassword('');
//         setLoginError('');

//         // ✅ Navigate to dashboard or role-specific page
//         navigate('/dashboard');
//       } else {
//         setLoginError(data.message || 'Invalid credentials');
//       }
//     } catch (error) {
//       setLoginError('Something went wrong. Try again.');
//     }
//   };

//   // Clear error after 4 seconds
//   useEffect(() => {
//     if (loginError) {
//       const timer = setTimeout(() => setLoginError(''), 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [loginError]);

//   return (
//     <div className="flex flex-col md:flex-row w-full h-screen">
//       {/* Left Section */}
//       <div className="w-full md:w-1/2 flex justify-center items-center bg-white px-6 py-8">
//         <div className="w-full max-w-sm">
//           {/* Top Row */}
//           <div className="relative mb-6 flex items-center justify-center">
//             <button
//               onClick={() => navigate(-1)}
//               className="absolute left-0 text-gray-700 hover:text-black flex items-center"
//             >
//               <ArrowLeft size={26} />
//             </button>
//             <div className="bg-black text-white rounded-[10px] px-4 py-2 text-lg font-bold">
//               Logo
//             </div>
//           </div>

//           <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome!</h2>
//           <p className="text-sm font-bold text-gray-600 mb-4">
//             Enter your credentials to access your account
//           </p>

//           {loginError && (
//             <div className="bg-red-500 text-white px-4 py-2 rounded mb-4 font-bold text-center">
//               {loginError}
//             </div>
//           )}

//           <label className="block font-bold text-sm text-gray-700 mb-1">
//             Email address
//           </label>
//           <input
//             type="email"
//             value={loginEmail}
//             placeholder="Enter your email"
//             onChange={(e) => setLoginEmail(e.target.value)}
//             className="w-full border rounded px-3 py-2 mb-3"
//           />

//           <div className="flex justify-between items-end mb-1">
//             <label className="block text-sm text-gray-700 font-bold">Password</label>
//             <a href="#" className="text-sm text-blue-600 font-bold">Forgot password?</a>
//           </div>
//           <input
//             type="password"
//             value={loginPassword}
//             placeholder="Enter your password"
//             onChange={(e) => setLoginPassword(e.target.value)}
//             className="w-full border rounded px-3 py-2 mb-3"
//           />

//           <div className="flex items-center text-sm mb-4">
//             <label className="font-bold">
//               <input type="checkbox" className="mr-1" /> Remember for 30 days
//             </label>
//           </div>

//           <button
//             className="bg-green-700 text-white w-full py-2 rounded hover:bg-green-800 mb-3 font-bold"
//             onClick={loginUser}
//           >
//             Login
//           </button>

//           <div className="flex items-center my-3">
//             <hr className="flex-grow border-gray-300" />
//             <span className="px-3 text-gray-500 font-bold">or</span>
//             <hr className="flex-grow border-gray-300" />
//           </div>

//           <div className="flex flex-col sm:flex-row gap-2 mb-2 font-bold">
//             <button className="w-full py-2 rounded border flex items-center justify-center gap-2">
//               <img src={googleIcon} alt="Google" className="w-5 h-5" />
//               Signup with Google
//             </button>
//             <button className="w-full py-2 rounded border flex items-center justify-center gap-2">
//               <img src={appleIcon} alt="Apple" className="w-5 h-5" />
//               Signup with Apple
//             </button>
//           </div>

//           <p className="text-sm font-bold text-center mt-2">
//             Don’t have an account?{' '}
//             <Link to="/signup" className="text-blue-600 font-bold">
//               Sign Up
//             </Link>
//           </p>
//         </div>
//       </div>

//       {/* Right Section */}
//       <div className="hidden md:flex w-1/2 items-center justify-end p-4">
//         <img
//           src={plantImage}
//           alt="plant"
//           className="w-full h-full object-cover rounded-xl"
//         />
//       </div>
//     </div>
//   );
// };

// export default Login;
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import plantImage from '../assets/plants.png';
import { ArrowLeft } from 'lucide-react';
import googleIcon from '../assets/google.png';
import appleIcon from '../assets/apple.png';
import Axios from 'axios';
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, user } = useAuth(); // ✅ Get user state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  // ✅ Remove auto-redirect (user must see login page first every time)
  /*
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admindashboard');
      else if (user.role === 'store1') navigate('/s1/dashboard');
      else navigate('/admindashboard');
    }
  }, [user, navigate]);
  */

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const response = await Axios.post('http://localhost:3002/login', {
        LoginEmail: loginEmail,
        LoginPassword: loginPassword,
      });
      
      const data = response.data;

      if (data.token && data.user) {
        // ✅ Save user + token in AuthContext (in-memory)
        login({
          name: data.user.name,
          role: data.user.role,
          token: data.token,
        });

        // Clear form
        setLoginEmail('');
        setLoginPassword('');
        setLoginError('');

        // ✅ Navigate based on role
        if (data.user.role === 'admin') {
          navigate('/admindashboard');
        } else if (data.user.role.startsWith('store')) {
          const storeId = data.user.role.replace('store', 's');
          navigate(`/manager/${storeId}/dashboard`);
        } else {
          // Fallback
          navigate('/admindashboard'); 
        }
      } else {
        setLoginError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setLoginError('Something went wrong. Try again.');
      console.error(error);
    }
  };

  // Clear error after 4 seconds
  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => setLoginError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Section */}
      <div className="w-full md:w-1/2 flex justify-center items-center bg-white px-6 py-8">
        <div className="w-full max-w-sm">
          {/* Top Row */}
          <div className="relative mb-6 flex items-center justify-center">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-0 text-gray-700 hover:text-black flex items-center"
            >
              <ArrowLeft size={26} />
            </button>
            <div className="bg-black text-white rounded-[10px] px-4 py-2 text-lg font-bold">
              Logo
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome!</h2>
          <p className="text-sm font-bold text-gray-600 mb-4">
            Enter your credentials to access your account
          </p>

          {loginError && (
            <div className="bg-red-500 text-white px-4 py-2 rounded mb-4 font-bold text-center">
              {loginError}
            </div>
          )}

          <label className="block font-bold text-sm text-gray-700 mb-1">
            Email address
          </label>
          <input
            type="email"
            value={loginEmail}
            placeholder="Enter your email"
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3"
          />

          <div className="flex justify-between items-end mb-1">
            <label className="block text-sm text-gray-700 font-bold">Password</label>
            <a href="#" className="text-sm text-blue-600 font-bold">Forgot password?</a>
          </div>
          <input
            type="password"
            value={loginPassword}
            placeholder="Enter your password"
            onChange={(e) => setLoginPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3"
          />

          <div className="flex items-center text-sm mb-4">
            <label className="font-bold">
              <input type="checkbox" className="mr-1" /> Remember for 30 days
            </label>
          </div>

          <button
            className="bg-green-700 text-white w-full py-2 rounded hover:bg-green-800 mb-3 font-bold"
            onClick={loginUser}
          >
            Login
          </button>

          <div className="flex items-center my-3">
            <hr className="flex-grow border-gray-300" />
            <span className="px-3 text-gray-500 font-bold">or</span>
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
            Don’t have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-bold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section */}
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

export default Login;