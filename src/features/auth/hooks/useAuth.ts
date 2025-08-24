import { useAuthState } from 'react-firebase-hooks/auth';
import { useDispatch } from 'react-redux';
import { auth } from '../../../config/firebase';
import { setUser, setLoading, setError } from '../authSlice';
import { useEffect } from 'react';

export const useAuth = () => {
  const [user, loading, error] = useAuthState(auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setUser(user || null));
  }, [user, dispatch]);

  useEffect(() => {
    dispatch(setLoading(loading));
  }, [loading, dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(setError(error.message));
    }
  }, [error, dispatch]);

  return { user, loading, error };
};
