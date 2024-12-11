/* eslint-disable */
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImNewTab } from "react-icons/im";
import { cn } from "@/lib/utils";
import { ContentType } from "@omnisat/lasereyes";

const Inscription = ({
  contentUrl,
  contentType,
  size,
  className,
  children,
}: {
  contentUrl: string;
  contentType: ContentType;
  size: number;
  children?: ReactNode;
  className?: string;
}) => {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);

  const getMimeType = (contentType: ContentType) =>
    contentType.split(";")[0].trim().toLowerCase();

  const isImageContentType = (contentType: ContentType) =>
    getMimeType(contentType).startsWith("image/") &&
    getMimeType(contentType) !== "image/gif" &&
    getMimeType(contentType) !== "image/svg+xml";

  const isGifContentType = (contentType: ContentType) =>
    getMimeType(contentType) === "image/gif";

  const isSvgContentType = (contentType: ContentType) =>
    getMimeType(contentType) === "image/svg+xml";

  const isHtmlContentType = (contentType: ContentType) =>
    getMimeType(contentType) === "text/html";

  useEffect(() => {
    if (
      isSvgContentType(contentType)
    ) {
      fetch(contentUrl)
        .then((response) => response.text())
        .then((svg) => {
          setSvgContent(svg);
        })
        .catch((error) => {
          console.error("Error fetching SVG content:", error);
        });
    }
  }, [contentUrl]);

  useEffect(() => {
    if (
      contentUrl &&
      contentType &&
      isImageContentType(contentType)
    ) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const img = new window.Image();
        img.src = contentUrl;
        img.onload = () => {
          const maxCanvasSize = size;
          const aspectRatio = img.width / img.height;

          let canvasWidth, canvasHeight;

          if (aspectRatio > 1) {
            canvasWidth = maxCanvasSize;
            canvasHeight = maxCanvasSize / aspectRatio;
          } else if (aspectRatio < 1) {
            canvasHeight = maxCanvasSize;
            canvasWidth = maxCanvasSize * aspectRatio;
          } else {
            canvasWidth = maxCanvasSize;
            canvasHeight = maxCanvasSize;
          }

          canvas.width = canvasWidth;
          canvas.height = canvasHeight;

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
  }, [contentUrl, size]);

  let content;

  if (
    contentUrl &&
    contentType &&
    isHtmlContentType(contentType)
  ) {
    content = (
      <iframe
        src={contentUrl}
        width={size}
        height={size}
        style={{ border: "none", borderRadius: "0.5rem" }}
        sandbox="allow-scripts allow-same-origin"
      />
    );
  } else if (
    contentUrl &&
    contentType &&
    isGifContentType(contentType)
  ) {
    content = (
      <img
        src={contentUrl}
        alt={"inscription"}
        style={{
          margin: "auto",
          display: "block",
          width: "120%",
          height: "auto",
        }}
      />
    );
  } else if (
    contentUrl &&
    contentType &&
    isSvgContentType(contentType)
  ) {
    content = svgContent ? (
      <DynamicSvgDisplay
        svgContent={svgContent}
        baseUrl={new URL(contentUrl).origin} // Pass base URL
        size={size}
      />
    ) : (
      <div>Loading...</div>
    );
  } else if (
    contentUrl &&
    contentType &&
    isImageContentType(contentType)
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
          color: "#fff",
        }}
      >
        Unsupported content type
      </div>
    );
  }

  return (
    <Card
      className={cn(
        `border h-full self-end w-full grow flex flex-col items-center hover:grow max-w-full mx-auto p-1  rounded justify-between`,
        className,
      )}
    >
      <CardHeader className="p-0 cursor-pointer transition-transform overflow-hidden justify-end hover:scale-105">
        {content}
      </CardHeader>
      <CardContent
        className={`p-0 w-full ${pathname === "/" ? "mt-0" : "mt-4"}`}
      >
        <div className="flex flex-col gap-1 w-full">
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

export default Inscription
