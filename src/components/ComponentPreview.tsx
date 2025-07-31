import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Tablet, Smartphone, Eye, Code, RefreshCw, Maximize2, Minimize2, AlertCircle, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComponentPreviewProps {
  jsxCode: string;
  cssCode: string;
  componentName?: string;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  jsxCode,
  cssCode,
  componentName
}) => {
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const viewportDimensions = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  const generatePreviewHTML = () => {
    // Clean and process the JSX code
    let processedJsxCode = jsxCode.trim();
    
    // Remove export default if present
    processedJsxCode = processedJsxCode.replace(/export\s+default\s+/, '');
    
    // Extract component name from the code
    const componentNameMatch = processedJsxCode.match(/(?:function|const)\s+(\w+)/);
    const extractedComponentName = componentNameMatch ? componentNameMatch[1] : (componentName || 'Component');
    
    // If the code doesn't define a component function, wrap it
    if (!processedJsxCode.includes('function') && !processedJsxCode.includes('const') && !processedJsxCode.includes('class')) {
      processedJsxCode = `function ${extractedComponentName}() {\n  return (\n    <div>\n      ${processedJsxCode}\n    </div>\n  );\n}`;
    }

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Preview</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #ffffff;
            color: #000000;
            min-height: 100vh;
            padding: 20px;
        }
        
        .preview-container {
            max-width: 100%;
            margin: 0 auto;
        }
        
        ${cssCode}
        
        /* Error display styles */
        .preview-error {
            color: #dc3545;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            padding: 15px;
            border-radius: 4px;
            margin: 10px 0;
            font-family: monospace;
            white-space: pre-wrap;
        }
        
        .preview-success {
            color: #155724;
            background: #d4edda;
            border: 1px solid #c3e6cb;
            padding: 15px;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect, useRef } = React;
        
        try {
            // Define the component
            ${processedJsxCode}
            
            // Create the app wrapper
            function App() {
                return (
                    <div className="preview-container">
                        <${extractedComponentName} />
                    </div>
                );
            }
            
            // Render the component
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
            
            // Show success message
            console.log('Component rendered successfully');
            
        } catch (error) {
            console.error('Preview error:', error);
            document.getElementById('root').innerHTML = \`
                <div class="preview-error">
                    <h3>Preview Error</h3>
                    <p><strong>Error:</strong> \${error.message}</p>
                    <p><strong>Code:</strong></p>
                    <pre>\${processedJsxCode}</pre>
                </div>
            \`;
        }
    </script>
</body>
</html>`;
    return htmlTemplate;
  };

  const refreshPreview = () => {
    setIsRefreshing(true);
    setPreviewError(null);
    
    if (iframeRef.current) {
      try {
        const htmlContent = generatePreviewHTML();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        iframeRef.current.src = url;
        
        // Handle iframe load events
        iframeRef.current.onload = () => {
          setIsRefreshing(false);
          URL.revokeObjectURL(url);
        };
        
        iframeRef.current.onerror = () => {
          setPreviewError('Failed to load preview');
          setIsRefreshing(false);
          URL.revokeObjectURL(url);
        };
        
        // Timeout fallback
        setTimeout(() => {
          setIsRefreshing(false);
        }, 3000);
      } catch (error) {
        setPreviewError('Failed to generate preview');
        setIsRefreshing(false);
      }
    }
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    // Refresh preview when entering fullscreen to ensure content loads
    if (!isFullscreen) {
      setTimeout(() => {
        refreshPreview();
      }, 100);
    }
  };

  useEffect(() => {
    if (jsxCode) {
      refreshPreview();
    }
  }, [jsxCode, cssCode]);

  // Ensure iframe content is loaded when entering fullscreen
  useEffect(() => {
    if (isFullscreen && iframeRef.current && jsxCode) {
      setTimeout(() => {
        refreshPreview();
      }, 200);
    }
  }, [isFullscreen]);

  const viewportButtons = [
    { size: 'desktop' as ViewportSize, icon: Monitor, label: 'Desktop' },
    { size: 'tablet' as ViewportSize, icon: Tablet, label: 'Tablet' },
    { size: 'mobile' as ViewportSize, icon: Smartphone, label: 'Mobile' }
  ];

  return (
    <>
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Live Preview - Fullscreen</h3>
                  {componentName && (
                    <Badge variant="secondary" className="text-xs">
                      {componentName}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-border rounded-lg p-1">
                    {viewportButtons.map((button) => (
                      <Button
                        key={button.size}
                        variant={viewportSize === button.size ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewportSize(button.size)}
                        className="gap-1 px-2 py-1 h-7"
                      >
                        <button.icon className="w-3 h-3" />
                        <span className="text-xs hidden sm:inline">{button.label}</span>
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshPreview}
                    disabled={isRefreshing}
                    className="gap-2"
                  >
                    <RefreshCw className={cn("w-3 h-3", isRefreshing && "animate-spin")} />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(false)}
                    className="gap-2"
                  >
                    <Minimize2 className="w-3 h-3" />
                    Exit Fullscreen
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4">
              <div 
                className="h-full overflow-auto bg-white rounded-lg border border-border"
                style={{
                  maxWidth: viewportSize !== 'desktop' ? viewportDimensions[viewportSize].width : '100%',
                  margin: viewportSize !== 'desktop' ? '0 auto' : undefined
                }}
              >
                <iframe
                  ref={iframeRef}
                  className="w-full h-full border-0 rounded-lg"
                  style={{
                    minHeight: viewportSize !== 'desktop' ? viewportDimensions[viewportSize].height : '100%'
                  }}
                  title="Component Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Card className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Live Preview</h3>
              {componentName && (
                <Badge variant="secondary" className="text-xs">
                  {componentName}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-border rounded-lg p-1">
                {viewportButtons.map((button) => (
                  <Button
                    key={button.size}
                    variant={viewportSize === button.size ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewportSize(button.size)}
                    className="gap-1 px-2 py-1 h-7"
                  >
                    <button.icon className="w-3 h-3" />
                    <span className="text-xs hidden sm:inline">{button.label}</span>
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshPreview}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={cn("w-3 h-3", isRefreshing && "animate-spin")} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFullscreenToggle}
                className="gap-2"
              >
                {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="h-full bg-muted rounded-lg overflow-hidden border border-border">
            {jsxCode ? (
              <div 
                className="h-full overflow-auto bg-white rounded-lg"
                style={{
                  maxWidth: viewportSize !== 'desktop' ? viewportDimensions[viewportSize].width : '100%',
                  margin: viewportSize !== 'desktop' ? '0 auto' : undefined
                }}
              >
                {previewError ? (
                  <div className="h-full flex items-center justify-center p-4">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                      <h4 className="font-medium mb-2 text-destructive">Preview Error</h4>
                      <p className="text-sm text-muted-foreground mb-4">{previewError}</p>
                      <Button onClick={refreshPreview} variant="outline" size="sm">
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Retry
                      </Button>
                    </div>
                  </div>
                ) : (
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full border-0 rounded-lg"
                    style={{
                      minHeight: viewportSize !== 'desktop' ? viewportDimensions[viewportSize].height : '400px'
                    }}
                    title="Component Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  />
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium mb-2">No Component to Preview</h4>
                  <p className="text-sm text-muted-foreground">
                    Write some code in the editor to see the preview
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </>
  );
};