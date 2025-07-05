import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { useLaserEyes } from "@omnisat/lasereyes-react";
import { formatAddress } from "../../lib/utils";
import { useCallback } from "react";
import Spinner from "../ui/spinner";
import { useLaserEyesModal } from "../../providers/LaserEyesModalContext";

export default function ConnectWalletButton({
  className,
  variant,
}: {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link";
}) {
  const { t } = useTranslation("common");
  const { isLoading, showModal } = useLaserEyesModal();
  const { address, connected, disconnect } = useLaserEyes();
  const onClick = useCallback(() => {
    if (isLoading) return;
    if (connected) {
      // TODO: Show disconnect confirmation before disconnecting
      disconnect();
    } else {
      showModal();
    }
  }, [isLoading, connected, showModal, disconnect]);

  return (
    <Button onClick={onClick} disabled={isLoading} className={className} variant={variant}>
      {isLoading ? (
        <>
          <Spinner className="lem-mr-2" /> {t("modal.loading")}
        </>
      ) : connected ? (
        formatAddress(address)
      ) : (
        t("modal.connect_wallet")
      )}
    </Button>
  );
}
