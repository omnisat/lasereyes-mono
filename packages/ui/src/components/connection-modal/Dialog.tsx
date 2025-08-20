import {
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { RemoveScroll } from "react-remove-scroll";
import { FocusTrap } from "./FocusTrap";
import { cn } from "../../lib/utils";

const stopPropagation: MouseEventHandler<unknown> = (event) =>
  event.stopPropagation();

interface DialogProps {
  open: boolean;
  onClose: () => void;
  titleId: string;
  onMountAutoFocus?: (event: Event) => void;
  children: ReactNode;
}

export function Dialog({ children, onClose, open, titleId }: DialogProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) =>
      open && event.key === "Escape" && onClose();

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const [bodyScrollable, setBodyScrollable] = useState(true);
  useEffect(() => {
    setBodyScrollable(
      getComputedStyle(window.document.body).overflow !== "hidden"
    );
  }, []);

  const handleBackdropClick = useCallback(() => onClose(), [onClose]);

  return (
    <>
      {open
        ? createPortal(
            <RemoveScroll enabled={bodyScrollable}>
              <div>
                <div
                  aria-modal
                  aria-labelledby={titleId}
                  role="dialog"
                  onClick={handleBackdropClick}
                  className={cn(
                    "lem-items-end md:lem-items-center",
                    "lem-fixed lem-font-mono",
                    "lem-backdrop-filter lem-backdrop-blur-[1px] lem-backdrop-brightness-50 lem-flex lem-justify-center",
                    "lem-fade-in lem-duration-150 lem-ease-in lem-animate-in",
                    "-lem-top-5 lem-bottom-0 -lem-right-5 -lem-left-5 lem-z-30",
                    "sm:lem-p-4 lem-pb-[env(safe-area-inset-bottom)]"
                  )}
                >
                  <FocusTrap
                    className={cn(
                      "lem-slide-in-from-bottom-full lem-duration-300 lem-ease-in-out lem-animate-in",
                      "lem-flex lem-flex-col lem-relative lem-slide-in-from-bottom-10 lem-fade-in-0 lem-w-auto lem-max-w-[100vw] lem-max-h-[100vh]"
                    )}
                    onClick={stopPropagation}
                    role="document"
                  >
                    {children}
                  </FocusTrap>
                </div>
              </div>
            </RemoveScroll>,
            document.body
          )
        : null}
    </>
  );
}
