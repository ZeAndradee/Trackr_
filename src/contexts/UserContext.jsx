import React, { useContext } from 'react';
import { UserLoggedContext, UserLoggedProvider } from './UserLoggedContext';

export const useUserContext = () => {
  const context = useContext(UserLoggedContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = UserLoggedProvider;

export const UserContext = UserLoggedContext;