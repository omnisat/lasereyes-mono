import type { ContentType } from '@kevinoyl/lasereyes'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const InscriptionComponent = ({
  contentUrl,
  contentType,
  size,
  className,
  children,
}: {
  contentUrl: string
  contentType: ContentType
  size: number
  children?: ReactNode
  className?: string
}) => {
  const pathname = usePathname()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [textContent, setTextContent] = useState<string | null>(null)
  const [jsonContent, setJsonContent] = useState<any | null>(null)
  const [jsContent, setJsContent] = useState<string | null>(null)

  const getMimeType = (contentType: ContentType) =>
    contentType.split(';')[0].trim().toLowerCase()

  const isImageContentType = (contentType: ContentType) =>
    getMimeType(contentType).startsWith('image/') &&
    getMimeType(contentType) !== 'image/gif' &&
    getMimeType(contentType) !== 'image/svg+xml'

  const isGifContentType = (contentType: ContentType) =>
    getMimeType(contentType) === 'image/gif'

  const isSvgContentType = (contentType: ContentType) =>
    getMimeType(contentType) === 'image/svg+xml'

  const isHtmlContentType = (contentType: ContentType) =>
    getMimeType(contentType) === 'text/html'

  const isTextContentType = (contentType: ContentType) =>
    getMimeType(contentType) === 'text/plain'

  const isJsonContentType = (contentType: ContentType) =>
    getMimeType(contentType) === 'application/json'

  const isJavaScriptContentType = (contentType: ContentType) =>
    getMimeType(contentType) === 'text/javascript'

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(contentUrl);
        const content = await response.text();

        if (isSvgContentType(contentType)) {
          setSvgContent(content);
        } else if (isTextContentType(contentType)) {
          setTextContent(content);
        } else if (isJsonContentType(contentType)) {
          try {
            setJsonContent(JSON.parse(content));
          } catch (error) {
            console.error('Error parsing JSON:', error);
            setJsonContent({ error: 'Invalid JSON format', raw: content });
          }
        } else if (isJavaScriptContentType(contentType)) {
          setJsContent(content);
        }
      } catch (error) {
        console.error(`Error fetching content (${contentType}):`, error);
      }
    };

    if (contentUrl) {
      fetchContent();
    }
  }, [contentUrl, contentType]);

  useEffect(() => {
    if (contentUrl && contentType && isImageContentType(contentType)) {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        const img = new window.Image()
        img.src = contentUrl
        img.onload = () => {
          const maxCanvasSize = size
          const aspectRatio = img.width / img.height

          let canvasWidth, canvasHeight

          if (aspectRatio > 1) {
            canvasWidth = maxCanvasSize
            canvasHeight = maxCanvasSize / aspectRatio
          } else if (aspectRatio < 1) {
            canvasHeight = maxCanvasSize
            canvasWidth = maxCanvasSize * aspectRatio
          } else {
            canvasWidth = maxCanvasSize
            canvasHeight = maxCanvasSize
          }

          canvas.width = canvasWidth
          canvas.height = canvasHeight

          const roundRect = (
            ctx: CanvasRenderingContext2D,
            x: number,
            y: number,
            width: number,
            height: number,
            radius: number
          ) => {
            if (width < 2 * radius) radius = width / 2
            if (height < 2 * radius) radius = height / 2
            ctx.moveTo(x + radius, y)
            ctx.arcTo(x + width, y, x + width, y + height, radius)
            ctx.arcTo(x + width, y + height, x, y + height, radius)
            ctx.arcTo(x, y + height, x, y, radius)
            ctx.arcTo(x, y, x + width, y, radius)
          }
          if (ctx) {
            ctx.imageSmoothingEnabled = false // Disable image smoothing for pixelated effect
            ctx.clearRect(0, 0, canvas.width, canvas.height) // Clear the canvas

            // Create a rounded rectangle path
            const radius = 0 // Adjust this value to change the corner radius
            ctx.beginPath()
            roundRect(ctx, 0, 0, canvas.width, canvas.height, radius)
            ctx.closePath()
            ctx.clip() // Clip to the rounded rectangle

            // Draw the image within the clipped area
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          }
          canvas.style.display = 'block'
        }
      }
    }
  }, [contentUrl, size, contentType])

  const renderContent = () => {
    const mimeType = getMimeType(contentType);

    if (isHtmlContentType(contentType)) {
      return (
        <iframe
          src={contentUrl}
          width={size}
          height={size}
          style={{ border: 'none', borderRadius: '0.5rem' }}
          sandbox="allow-scripts allow-same-origin"
        />
      );
    }

    if (isGifContentType(contentType)) {
      return (
        <img
          src={contentUrl}
          alt="GIF inscription"
          style={{
            margin: 'auto',
            display: 'block',
            width: '100%',
            height: 'auto',
          }}
        />
      );
    }

    if (isSvgContentType(contentType)) {
      return svgContent ? (
        <DynamicSvgDisplay
          svgContent={svgContent}
          baseUrl={new URL(contentUrl).origin}
          size={size}
        />
      ) : (
        <div className="flex items-center justify-center h-full">Loading SVG...</div>
      );
    }

    if (isImageContentType(contentType)) {
      return (
        <canvas
          ref={canvasRef}
          id="canvas"
          style={{
            border: '1px solid #ddd',
            margin: '0 auto',
            width: '100%',
            height: '100%',
          }}
        />
      );
    }

    if (isTextContentType(contentType)) {
      return (
        <div
          style={{
            width: '100%',
            height: size,
            padding: '1rem',
            overflowY: 'auto',
            backgroundColor: '#0e1a15',
            color: '#fff',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
        >
          <pre style={{ margin: 0, width: '100%' }}>
            {textContent || 'Loading text content...'}
          </pre>
        </div>
      );
    }

    if (isJsonContentType(contentType)) {
      return (
        <div
          style={{
            width: '100%',
            height: size,
            padding: '1rem',
            overflowY: 'auto',
            backgroundColor: '#0e1a15',
            color: '#fff',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
          }}
        >
          <pre style={{ margin: 0, width: '100%' }}>
            {jsonContent ? JSON.stringify(jsonContent, null, 2) : 'Loading JSON content...'}
          </pre>
        </div>
      );
    }

    if (isJavaScriptContentType(contentType)) {
      return (
        <div
          style={{
            width: '100%',
            height: size,
            padding: '1rem',
            overflowY: 'auto',
            backgroundColor: '#0e1a15',
            color: '#E9D16C', // JavaScript syntax highlighting color
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
          }}
        >
          <pre style={{ margin: 0, width: '100%' }}>
            {jsContent || 'Loading JavaScript content...'}
          </pre>
        </div>
      );
    }

    // Fallback for unsupported content types - Display a more user-friendly message with mime type
    return (
      <div
        style={{
          width: '100%',
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0e1a15',
          color: '#fff',
          padding: '1rem',
          textAlign: 'center',
          fontFamily: 'sans-serif'
        }}
      >
        <div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>
            {mimeType}
          </div>
          <div style={{ fontSize: '14px', color: '#999' }}>
            Preview not available
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        `h-full border-gray-500 shadow-xl self-end w-full grow flex flex-col items-center hover:grow max-w-full mx-auto rounded justify-between`,
        className
      )}
    >
      <CardHeader className="p-0 cursor-pointer transition-transform overflow-hidden justify-end hover:scale-105 w-full">
        {renderContent()}
      </CardHeader>
      <CardContent
        className={`p-0 w-full ${pathname === '/' ? 'mt-0' : 'mt-4'}`}
      >
        <div className="flex flex-col gap-1 w-full">{children}</div>
      </CardContent>
    </Card>
  )
}

const DynamicSvgDisplay = ({
  svgContent,
  baseUrl,
  size = 500,
}: {
  svgContent: string
  baseUrl: string
  size?: number
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

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
      `

      // Inject the HTML content into the iframe
      const iframeDoc =
        iframeRef.current.contentDocument ||
        iframeRef.current.contentWindow?.document
      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write(htmlContent)
        iframeDoc.close()
      }
    }
  }, [svgContent, baseUrl])

  return (
    <iframe
      ref={iframeRef}
      width={size}
      height={size}
      style={{ border: 'none' }}
      title="Dynamic SVG Display"
    />
  )
}

export default InscriptionComponent
