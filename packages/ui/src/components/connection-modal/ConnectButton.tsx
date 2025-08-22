import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { useLaserEyes } from "@kevinoyl/lasereyes";
import { useCallback, useState, useLayoutEffect } from "react";
import Spinner from "../ui/spinner";
import { useLaserEyesModal } from "../../providers/LaserEyesModalContext";
import AccountInfo from "../user-profile/AccountInfo";
import { Wallet, ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Dialog } from "./Dialog";
import DialogContent from "./DialogContent";

export default function ConnectWalletButton({
  className,
  variant,
}: {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link";
}) {
  const { t } = useTranslation("common");
  const { isLoading, showModal } = useLaserEyesModal();
  const { connected, disconnect, address } = useLaserEyes((state) => ({
    connected: state.connected,
    disconnect: state.disconnect,
    address: state.address,
  }));
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useLayoutEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const onClick = useCallback(() => {
    if (isLoading) return;
    if (connected) {
      // TODO: Show disconnect confirmation before disconnecting
      disconnect();
    } else {
      showModal();
    }
  }, [isLoading, connected, showModal, disconnect]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopoverOpen(true);
  };

  const AccountInfoModal = () => (
    <Dialog
      open={popoverOpen}
      onClose={() => setPopoverOpen(false)}
      titleId="account-info-modal"
    >
      <DialogContent className="lem-relative lem-border-none lem-overflow-hidden lem-bg-background lem-p-0">
        <AccountInfo />
      </DialogContent>
    </Dialog>
  );

  // Connected state - unified compact design
  if (connected && address) {
    return isMobile ? (
      <>
        <button
          type="button"
          className="lem-inline-flex lem-items-center lem-gap-2 lem-bg-green-50 dark:lem-bg-green-950 lem-border lem-border-green-200 dark:lem-border-green-800 lem-px-4 lem-py-2.5 lem-rounded-full lem-shadow-sm lem-transition-all lem-duration-200 hover:lem-shadow-md hover:lem-bg-green-100 dark:hover:lem-bg-green-900 focus-visible:lem-outline-none focus-visible:lem-ring-2 focus-visible:lem-ring-green-500"
          aria-label="Show account info"
          onClick={handleBadgeClick}
          tabIndex={0}
        >
          {/* Status dot */}
          <div className="lem-w-2 lem-h-2 lem-bg-green-500 lem-rounded-full lem-animate-pulse lem-flex-shrink-0"></div>

          {/* Wallet icon */}
          <Wallet className="lem-h-4 lem-w-4 lem-text-green-700 dark:lem-text-green-300 lem-flex-shrink-0" />

          {/* Address */}
          <span className="lem-font-mono lem-text-sm lem-font-medium lem-text-green-800 dark:lem-text-green-200">
            {formatAddress(address)}
          </span>

          {/* Dropdown indicator */}
          <ChevronDown className="lem-h-3.5 lem-w-3.5 lem-text-green-600 dark:lem-text-green-400 lem-flex-shrink-0" />
        </button>
        <AccountInfoModal />
      </>
    ) : (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="lem-inline-flex lem-items-center lem-gap-2 lem-bg-green-50 dark:lem-bg-green-950 lem-border lem-border-green-200 dark:lem-border-green-800 lem-px-4 lem-py-2.5 lem-rounded-full lem-shadow-sm lem-transition-all lem-duration-200 hover:lem-shadow-md hover:lem-bg-green-100 dark:hover:lem-bg-green-900 focus-visible:lem-outline-none focus-visible:lem-ring-2 focus-visible:lem-ring-green-500"
            aria-label="Show account info"
            onClick={e => { e.stopPropagation(); }}
            tabIndex={0}
          >
            {/* Status dot */}
            <div className="lem-w-2 lem-h-2 lem-bg-green-500 lem-rounded-full lem-animate-pulse lem-flex-shrink-0"></div>

            {/* Wallet icon */}
            <Wallet className="lem-h-4 lem-w-4 lem-text-green-700 dark:lem-text-green-300 lem-flex-shrink-0" />

            {/* Address */}
            <span className="lem-font-mono lem-text-sm lem-font-medium lem-text-green-800 dark:lem-text-green-200">
              {formatAddress(address)}
            </span>

            {/* Dropdown indicator */}
            <ChevronDown className="lem-h-3.5 lem-w-3.5 lem-text-green-600 dark:lem-text-green-400 lem-flex-shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="lem-w-[min(95vw,480px)] lem-max-w-[95vw]"
          onOpenAutoFocus={(e: Event) => e.preventDefault()}
        >
          <AccountInfo />
        </PopoverContent>
      </Popover>
    );
  }

  // Default button for non-connected state
  return (
    <Button onClick={onClick} disabled={isLoading} className={className} variant={variant}>
      {isLoading ? (
        <>
          <Spinner className="lem-mr-2" /> {t("modal.loading")}
        </>
      ) : (
        t("modal.connect_wallet")
      )}
    </Button>
  );
}
