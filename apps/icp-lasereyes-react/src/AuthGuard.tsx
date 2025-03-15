/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

import LoginPage from './components/login/LoginPage';
import { useSiwbIdentity } from 'ic-siwb-lasereyes-connector';

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isInitializing, identity } = useSiwbIdentity();

  // If the user is not connected, clear the session.

  // If user switches to an unsupported network, clear the session.

  // If the user switches to a different address, clear the session.

  if (isInitializing) {
    return null;
  }

  // If wallet is not connected or there is no identity, show login page.
  if (!isInitializing && !identity) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
