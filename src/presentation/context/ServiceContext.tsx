import React, { createContext, useContext } from 'react';
import { appContainer, DIContainer } from '../../di/container';

const ServiceContext = createContext<DIContainer>(appContainer);

interface ServiceProviderProps {
  container?: DIContainer;
  children: React.ReactNode;
}

export function ServiceProvider({
  container = appContainer,
  children,
}: ServiceProviderProps) {
  return (
    <ServiceContext.Provider value={container}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useContainer(): DIContainer {
  return useContext(ServiceContext);
}
