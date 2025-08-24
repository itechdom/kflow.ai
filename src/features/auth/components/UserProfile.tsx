import React from 'react';
import { useAuthContext } from '../AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';

const UserProfile: React.FC = () => {
  const { user, signOut } = useAuthContext();
  const { loading } = useSelector((state: RootState) => state.auth);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3">
        {user.photoURL && (
          <img
            className="h-8 w-8 rounded-full ring-2 ring-gray-200"
            src={user.photoURL}
            alt={user.displayName || user.email || 'User'}
          />
        )}
        <div className="text-sm">
          <p className="text-gray-900 font-medium">
            {user.displayName || 'User'}
          </p>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>
      
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors duration-200 shadow-sm"
      >
        {loading ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  );
};

export default UserProfile;
