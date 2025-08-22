import { useLaserEyes, WalletIcon, LaserEyesLogo } from "@kevinoyl/lasereyes";
import { useTranslation } from "react-i18next";

import { Dialog } from "./Dialog";
import DialogContent from "./DialogContent";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import useSupportedProviders from "../../hooks/useSupportedProviders";
import "../../i18n/setup";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Alert } from "../ui/alert";
import { useState, useCallback, useMemo } from "react";
import "../index.css";

export interface ConnectModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ConnectWalletModal({ onClose, open }: ConnectModalProps) {
  const { isConnecting, disconnect } = useLaserEyes();
  const { t } = useTranslation("common");
  const { otherWallets, installedWallets } = useSupportedProviders();
  const allWallets = useMemo(
    () => [...installedWallets, ...otherWallets],
    [installedWallets, otherWallets]
  );

  const [errorMsg, setErrorMsg] = useState<string | undefined>();

  function resetState() {
    setErrorMsg(undefined);
  }

  const stopConnecting = useCallback(() => {
    if (isConnecting) disconnect();
  }, [disconnect, isConnecting]);

  const onConnectModalCancel = useCallback(() => {
    stopConnecting();
    onClose();
    resetState();
  }, [stopConnecting, onClose]);

  return (
    <Dialog onClose={onConnectModalCancel} open={open} titleId={"lwm_connect_dialog"}>
      <div className="lem-w-[480px]">
        <DialogContent className='lem-relative lem-overflow-hidden lem-bg-background'>
          <IsConnectingStep isConnecting={isConnecting} stopConnecting={stopConnecting} />
          <CardHeader>
            {errorMsg && (
              <Alert variant={"destructive"} className='lem-mb-4'>
                <div>
                  {t("modal.error_occurred")}: {errorMsg}
                </div>
              </Alert>
            )}
            <CardTitle className='lem-text-center'>{t("modal.connect_wallet")}</CardTitle>
          </CardHeader>
          <CardContent className='lem-w-full lem-space-y-6 lem-overflow-auto lem-max-h-[560px]'>
            {allWallets.length > 0 && (
              <div className='lem-space-y-4'>
                <ul className='lem-mt-2 lem-gap-4 lem-grid lem-grid-cols-1'>
                  {allWallets.map((e, i) => (
                    <li key={e.connectorId}>
                      <Button
                        variant={"ghost"}
                        onClick={() => {
                          (e as unknown as (typeof installedWallets)[number])
                            .connect?.()
                            .then((e) => {
                              if (e !== undefined) setErrorMsg(e);
                              else onClose();
                            });
                        }}
                        className={cn(
                          "lem-w-full lem-bg-card",
                          "hover:lem-bg-accent",
                          "lem-text-card-foreground lem-text-base lem-font-normal",
                          "lem-group",
                          "lem-h-16 lem-p-4 lem-border lem-border-border lem-rounded-xl lem-flex lem-flex-wrap lem-w-full lem-gap-4",
                          "lem-transition-colors lem-duration-200"
                        )}>
                        <div className='lem-flex lem-grow lem-items-center lem-gap-3'>
                          <WalletIcon size={32} walletName={e.connectorId} />
                          <div className='lem-text-lg lem-font-semibold'>{e.label}</div>
                        </div>
                        {i < installedWallets.length ? (
                          <div className='lem-flex lem-items-center'>
                            <div className='lem-flex lem-items-center lem-gap-2 group-hover:lem-hidden'>
                              <div className='lem-w-2 lem-h-2 lem-rounded-full lem-bg-primary'></div>
                              <span className='lem-text-sm lem-text-muted-foreground'>
                                Installed
                              </span>
                            </div>
                            <ChevronRight className='lem-w-5 lem-h-5 lem-text-muted-foreground lem-hidden group-hover:lem-block' />
                          </div>
                        ) : (
                          <a
                            href={e.installUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='lem-flex lem-items-center lem-gap-2 lem-text-primary/80 hover:lem-text-primary'
                            onClick={(e) => e.stopPropagation()}>
                            <ChevronRight className='lem-w-4 lem-h-4' />
                            <span className='lem-text-sm'>Install</span>
                          </a>
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter className='lem-justify-center lem-w-full lem-bg-gradient-to-r lem-from-primary/5 lem-via-primary/10 lem-to-primary/5 lem-p-4 lem-pt-5 lem-border-t lem-border-primary/20 lem-group lem-relative'>
            <div className='lem-text-muted-foreground lem-text-sm lem-text-center lem-transition-opacity lem-duration-300 lem-ease-in-out lem-opacity-100 group-hover:lem-opacity-0'>
              <a href='https://www.lasereyes.build/' target='_blank' rel='noopener noreferrer'>
                Powered by LaserEyes
              </a>
            </div>
            <div className='lem-absolute lem-top-5 lem-left-0 lem-right-0 lem-transition-opacity lem-duration-500 lem-ease-in-out lem-opacity-0 group-hover:lem-opacity-100'>
              <a
                href='https://www.lasereyes.build/'
                target='_blank'
                rel='noopener noreferrer'
                className='lem-flex lem-justify-center'>
                <LaserEyesLogo width={48} color={"blue"} />
              </a>
            </div>
          </CardFooter>
        </DialogContent>
      </div>
    </Dialog>
  );
}
function IsConnectingStep({
  isConnecting,
  stopConnecting,
}: {
  isConnecting: boolean;
  stopConnecting: () => void;
}) {
  const { t } = useTranslation("common");
  return (
    <div
      className={cn(
        { "lem-translate-x-full": !isConnecting },
        "lem-duration-300 lem-translate-x-0",
        "lem-absolute lem-w-full lem-h-full lem-z-10",
        "lem-rounded-[inherit] lem-bg-inherit lem-p-[var(--radius)]"
      )}>
      {/* Tailwind Loading spinner at the center */}
      <Button variant={"outline"} className='lem-text-primary/80' onClick={() => stopConnecting()}>
        <ChevronLeft className='lem-h-6 lem-w-6 lem-inline-block' /> Go back
      </Button>
      <div className='lem-flex lem-flex-col lem-gap-3 md:lem-gap-6 lem-justify-center lem-items-center lem-w-full lem-h-full'>
        <svg
          className={cn(
            { "lem-animate-spin": isConnecting },
            "lem-duration-1000 lem-text-primary",
            "lem-h-8 lem-w-8 sm:lem-h-12 sm:lem-w-12 md:lem-h-16 md:lem-w-16"
          )}
          fill='none'
          viewBox='0 0 24 24'>
          <circle
            className='lem-opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'></circle>
          <path
            className='lem-opacity-75'
            d='M12 6v6m0 0v6m0-6h6m-6 0H6'
            stroke='currentColor'
            strokeWidth='4'></path>
        </svg>
        <div className='lem-text-center'>{t("modal.connecting_wallet")}</div>
      </div>
    </div>
  );
}
