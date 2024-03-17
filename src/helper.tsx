import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });
  const setValue = (value: T) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue];
}

const getNetwork = () => {
  return import.meta.env.VITE_NETWORK &&
    ['mainnet', 'preview', 'preprod', 'MAINNET', 'PREVIEW', 'PREPROD'].includes(
      import.meta.env.VITE_NETWORK
    )
    ? import.meta.env.VITE_NETWORK.toLowerCase()
    : 'mainnet';
};

const getWindowDimensions = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions(getWindowDimensions());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};

const getEllipsisText = (text: string, n = 12) => {
  if (text) {
    return `${text.slice(0, n)}...${text.slice(text.length - n)}`;
  }
  return '';
};

export { useLocalStorage, useWindowDimensions, getEllipsisText, getNetwork };
