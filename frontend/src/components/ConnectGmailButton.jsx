import React from 'react';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

import toast from 'react-hot-toast';

const ConnectGmailButton = () => {
  const handleConnect = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.AUTH.CONNECT_GMAIL);
      const { url } = res.data;
      // Open Google consent page in new window/tab
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success('Google sign-in opened. Complete the flow and refresh this page when done.');
    } catch (err) {
      console.error(err);
      toast.error('Could not get Google sign-in URL');
    }
  };

  return (
    <button onClick={handleConnect} className="px-3 py-2 bg-blue-600 text-white rounded">
      Connect Gmail
    </button>
  );
}

export default ConnectGmailButton