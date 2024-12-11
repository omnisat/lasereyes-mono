/* eslint-disable */
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImNewTab } from "react-icons/im";
import { cn } from "@/lib/utils";
import DynamicSvgDisplay from "@/components/DynamicSvgDisplay";

const Inscription = ({
  inscriptionId,
  contentType,
  size,
  className,
  children,
}: {
  inscriptionId: string;
  contentType: string;
  size: number;
  children?: ReactNode;
  className?: string;
}) => {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);

  const getMimeType = (contentType: string) =>
    contentType.split(";")[0].trim().toLowerCase();

  const isImageContentType = (contentType: string) =>
    getMimeType(contentType).startsWith("image/") &&
    getMimeType(contentType) !== "image/gif" &&
    getMimeType(contentType) !== "image/svg+xml";

  const isGifContentType = (contentType: string) =>
    getMimeType(contentType) === "image/gif";

  const isSvgContentType = (contentType: string) =>
    getMimeType(contentType) === "image/svg+xml";

  const isHtmlContentType = (contentType: string) =>
    getMimeType(contentType) === "text/html";

  useEffect(() => {
    if (
      isSvgContentType(asset.effective_content_type)
    ) {
      fetch(asset.image_url)
        .then((response) => response.text())
        .then((svg) => {
          setSvgContent(svg);
        })
        .catch((error) => {
          console.error("Error fetching SVG content:", error);
        });
    }
  }, [asset]);

  useEffect(() => {
    if (
      asset &&
      asset.effective_content_type &&
      isImageContentType(asset.effective_content_type)
    ) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const img = new window.Image();
        img.src = asset.image_url;
        img.onload = () => {
          const maxCanvasSize = size;
          const aspectRatio = img.width / img.height;

          let canvasWidth, canvasHeight;

          if (aspectRatio > 1) {
            // Image is wider than tall
            canvasWidth = maxCanvasSize;
            canvasHeight = maxCanvasSize / aspectRatio;
          } else if (aspectRatio < 1) {
            // Image is taller than wide
            canvasHeight = maxCanvasSize;
            canvasWidth = maxCanvasSize * aspectRatio;
          } else {
            // Image is square
            canvasWidth = maxCanvasSize;
            canvasHeight = maxCanvasSize;
          }

          canvas.width = canvasWidth;
          canvas.height = canvasHeight;

          // Function to draw a rounded rectangle path
          const roundRect = (
            ctx: CanvasRenderingContext2D,
            x: number,
            y: number,
            width: number,
            height: number,
            radius: number,
          ) => {
            if (width < 2 * radius) radius = width / 2;
            if (height < 2 * radius) radius = height / 2;
            ctx.moveTo(x + radius, y);
            ctx.arcTo(x + width, y, x + width, y + height, radius);
            ctx.arcTo(x + width, y + height, x, y + height, radius);
            ctx.arcTo(x, y + height, x, y, radius);
            ctx.arcTo(x, y, x + width, y, radius);
          };
          if (ctx) {
            ctx.imageSmoothingEnabled = false; // Disable image smoothing for pixelated effect
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

            // Create a rounded rectangle path
            const radius = 0; // Adjust this value to change the corner radius
            ctx.beginPath();
            roundRect(ctx, 0, 0, canvas.width, canvas.height, radius);
            ctx.closePath();
            ctx.clip(); // Clip to the rounded rectangle

            // Draw the image within the clipped area
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
          canvas.style.display = "block";
        };
      }
    }
  }, [asset, asset?.image_url, size]);

  let content;

  if (
    asset &&
    asset.effective_content_type &&
    isHtmlContentType(asset.effective_content_type)
  ) {
    content = (
      <iframe
        src={asset.image_url}
        width="100%"
        height={size}
        style={{ border: "none", borderRadius: "0.5rem" }}
        sandbox="allow-scripts allow-same-origin"
      />
    );
  } else if (
    asset &&
    asset.effective_content_type &&
    isGifContentType(asset.effective_content_type)
  ) {
    content = (
      <img
        src={asset.image_url}
        alt={asset.asset_name}
        style={{
          margin: "auto",
          display: "block",
          width: "120%",
          height: "auto",
        }}
      />
    );
  } else if (
    asset &&
    asset.effective_content_type &&
    isSvgContentType(asset.effective_content_type)
  ) {
    content = svgContent ? (
      <DynamicSvgDisplay
        svgContent={svgContent}
        baseUrl={new URL(asset.image_url).origin} // Pass base URL
        size={size}
      />
    ) : (
      <div>Loading...</div>
    );
  } else if (
    asset &&
    asset.effective_content_type &&
    isImageContentType(asset.effective_content_type)
  ) {
    content = (
      <canvas
        ref={canvasRef}
        id="canvas"
        style={{
          // imageRendering: "pixelated",
          margin: "10px auto",
          // display: "none",
          width: "100%",
          height: "100%",
        }}
      />
    );
  } else {
    // Handle other content types or provide a fallback
    content = (
      <div
        style={{
          width: size - 20,
          height: size,
          display: "block",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0e1a15",
        }}
      >
        Unsupported content type
      </div>
    );
  }

  return (
    <Card
      className={cn(
        `border h-full self-end w-full grow flex flex-col items-center hover:grow max-w-full mx-auto p-4 rounded justify-between`,
        className,
      )}
    >
      <CardHeader className="p-0 cursor-pointer transition-transform justify-end hover:scale-105">
        <Link
          href={
            "/collections/" +
            asset?.collection_name?.toLowerCase().replaceAll(" ", "-") +
            "/" +
            asset?.inscription_id
          }
        >
          {content}
        </Link>
      </CardHeader>
      <CardContent
        className={`p-0 w-full ${pathname === "/" ? "mt-0" : "mt-4"}`}
      >
        <CardTitle className="text-white text-md">
          {asset?.asset_name}
        </CardTitle>
        {listing?.price_fractal && (
          <span className="flex text-lg  mt-2 justify-between gap-0 w-full">
            <div className={"grow"} />
            <span className="text-orange-300 flex flex-row gap-1 justify-center items-center">
              {listing?.price_fractal} <FractalIcon size={12} />
            </span>
            <div className={"grow"} />
          </span>
        )}
        <Link
          target={"_blank"}
          href={`https://fractal.ordstuff.info/inscription/${asset?.inscription_id}`}
        >
          <div
            className={
              "w-full self-center text-xs hover:text-yellow-500 items-center mt-2 justify-center flex flex-row gap-1 text-gray-400 text-center"
            }
          >
            #{asset?.number}
            <ImNewTab size={14} className={"-mt-0.5"} />
          </div>
        </Link>
        {showCollectionName ? (
          <Link
            href={`/collections/${asset?.collection_name?.toLowerCase().replaceAll(" ", "-")}`}
          >
            <div
              className={cn(
                "text-center text-gray-400 hover:text-orange-300 text-xs",
                getTailwindTextColor(asset?.collection_name || ""),
              )}
            >
              {asset?.collection_name}
            </div>
          </Link>
        ) : null}
        <div className="flex flex-col gap-1 w-full">
          {listing && showBuyButton && (
            <>
              <BuyModal
                disabled={listing.reserved}
                asset={asset!}
                listing={listing}
              />
            </>
          )}
          {pathname !== "/" && showTerminalLink && (
            <div className="flex justify-center w-full">
              <Button
                onClick={() =>
                  window.open(
                    `https://www.fractalexplorer.io/inscription/${asset!.inscription_id}`,
                    "_blank",
                  )
                }
                className="w-full bg-[#404040] hover:bg-black text-xs sm:text-sm hover:scale-105 transition-transform text-white"
              >
                <img
                  className="max-h-full mr-2"
                  src="/terminal.png"
                  alt="terminal"
                />{" "}
                <ImNewTab />
              </Button>
            </div>
          )}
          {(pathname === "/market" || pathname === "/") && showBuyButton && (
            <div className="w-full">
              <Link
                href={`/collections/${asset?.collection_name?.toLowerCase().replaceAll(" ", "-") ||
                  "unknown"
                  }`}
                className="w-full"
              >
                <Button className="w-full gap-2 bg-[#404040] rounded-sm hover:text-black text-xs sm:text-sm hover:scale-105 transition-transform text-white">
                  View{" "}
                  <span
                    className={cn(
                      getTailwindTextColor(asset?.collection_name ?? "fm"),
                      "hover:text-black",
                    )}
                  >
                    {/* {asset?.collection_name} */}
                    Collection
                  </span>
                </Button>
              </Link>
            </div>
          )}
          {children}
        </div>
      </CardContent>
    </Card>
  );
};


const DynamicSvgDisplay = ({
  svgContent,
  baseUrl,
  size = 500,
}: {
  svgContent: string;
  baseUrl: string;
  size?: number;
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (iframeRef.current && svgContent) {
      // Create the HTML string with the <base> tag and the SVG content
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>SVG Display</title>
          <base href="${baseUrl}">
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
            }
            svg {
              width: 100%;
              height: 100%;
            }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
        </html>
      `;

      // Inject the HTML content into the iframe
      const iframeDoc =
        iframeRef.current.contentDocument ||
        iframeRef.current.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
      }
    }
  }, [svgContent, baseUrl]);

  return (
    <iframe
      ref={iframeRef}
      width={size}
      height={size}
      style={{ border: "none" }}
      title="Dynamic SVG Display"
    />
  );
};

export default NFT;
