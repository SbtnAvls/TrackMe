import { createContext, useContext, useState } from 'react';

const PrivacyContext = createContext();

export function PrivacyProvider({ children }) {
  const [isHidden, setIsHidden] = useState(false);

  const togglePrivacy = () => setIsHidden(!isHidden);

  const maskValue = (value) => {
    if (isHidden) return '••••••';
    return value;
  };

  return (
    <PrivacyContext.Provider value={{ isHidden, togglePrivacy, maskValue }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}
