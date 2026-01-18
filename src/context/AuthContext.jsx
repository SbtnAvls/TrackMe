import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setInitializing(false);
      },
      (authError) => {
        console.error('Error en el estado de autenticación', authError);
        setError(authError);
        setInitializing(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setIsProcessing(true);
      await signInWithPopup(auth, googleProvider);
    } catch (authError) {
      console.error('Error al iniciar sesión con Google', authError);
      setError(authError);
      throw authError;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setError(null);
      setIsProcessing(true);
      await signOut(auth);
    } catch (authError) {
      console.error('Error al cerrar sesión', authError);
      setError(authError);
      throw authError;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        error,
        isProcessing,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
}
