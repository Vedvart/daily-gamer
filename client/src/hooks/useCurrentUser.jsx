import { createContext, useContext } from 'react';

const CurrentUserContext = createContext({ isGuest: true });

export function CurrentUserProvider({ children }) {
  return (
    <CurrentUserContext.Provider value={{ isGuest: true }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(CurrentUserContext);
}

export default useCurrentUser;
