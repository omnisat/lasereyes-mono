import ConnectButton from './ConnectButton';
import React from 'react';
import { Typography } from 'antd';

export default function LoginPage(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen gap-10">
      <Typography.Title style={{ color: '#fff' }}>Internet Computer + React + Sign In With Bitcoin</Typography.Title>
      <ConnectButton />
    </div>
  );
}
