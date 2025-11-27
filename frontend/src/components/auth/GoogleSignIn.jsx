// components/auth/GoogleSignIn.jsx

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const GoogleSignIn = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSuccess = async (credentialResponse) => {
        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.GOOGLE_LOGIN, {
                token: credentialResponse.credential
            });

            // Store token
            localStorage.setItem('token', response.data.token);

            // Update auth context
            login(response.data);

            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error('Google sign-in failed');
        }
    };

    const handleError = () => {
        toast.error('Google sign-in was unsuccessful');
    };

    return (
        <div className="mt-4">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">Or continue with</span>
                </div>
            </div>

            <div className="mt-4 flex justify-center">
                <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
            </div>
        </div>
    );
};

export default GoogleSignIn;