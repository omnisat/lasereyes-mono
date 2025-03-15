import { useState } from 'react';
import { Button } from 'antd';
import ConnectDialog from '../ConnectDialog';

export default function ConnectButton() {
  // const { isConnecting } = useAccount();
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);

  const handleClick = async () => {
    // if (isConnecting) return;
    setConnectDialogOpen(true);
  };

  const buttonText = 'Connect wallet and Sign';

  return (
    <>
      <Button
        className="w-44"
        type="primary"
        onClick={handleClick}
        // loading={isConnecting}
      >
        {buttonText}
      </Button>
      <ConnectDialog isOpen={connectDialogOpen} setIsOpen={() => setConnectDialogOpen(false)} />
    </>
  );
}
