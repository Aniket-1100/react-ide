import React, { useState } from 'react';
import { toast } from 'sonner';
import { CodeEditor } from './CodeEditor';
import { ComponentPreview } from './ComponentPreview';
import { Button } from '@/components/ui/button';
import { X, Clock, Trash2, Download, FileCode } from 'lucide-react';

interface Component {
  jsxCode: string;
  cssCode: string;
  componentName: string;
}

export const ComponentGenerator: React.FC = () => {
  const [currentComponent, setCurrentComponent] = useState<Component>(() => {
    // Try to load auto-saved content on startup
    try {
      const autoSaved = localStorage.getItem('react-ide-auto-save');
      if (autoSaved) {
        const data = JSON.parse(autoSaved);
        return {
          jsxCode: data.jsxCode || '',
          cssCode: data.cssCode || '',
          componentName: data.componentName || 'MyComponent'
        };
      }
    } catch (error) {
      console.error('Failed to load auto-saved content:', error);
    }
    
    return {
      jsxCode: '',
      cssCode: '',
      componentName: 'MyComponent'
    };
  });

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  const handleCodeChange = (jsxCode: string, cssCode: string) => {
    setCurrentComponent(prev => ({
      ...prev,
      jsxCode,
      cssCode
    }));
    
    // Auto-save to localStorage
    try {
      const componentData = {
        jsxCode,
        cssCode,
        componentName: currentComponent.componentName,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('react-ide-auto-save', JSON.stringify(componentData));
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const createNewComponent = () => {
    const newComponent = {
      jsxCode: `function NewComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <h1>Welcome to React IDE</h1>
      <p>Start coding your component here!</p>
      <button 
        className="button"
        onClick={() => setCount(count + 1)}
      >
        Clicked {count} times
      </button>
    </div>
  );
}`,
      cssCode: `.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.button {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.button:hover {
  background: #0056b3;
}`,
      componentName: 'NewComponent'
    };
    setCurrentComponent(newComponent);
    toast.success('New component created!');
  };

  const clearWorkspace = () => {
    setCurrentComponent({
      jsxCode: '',
      cssCode: '',
      componentName: 'MyComponent'
    });
    toast.success('Workspace cleared!');
  };

  const saveComponent = () => {
    const componentData = {
      ...currentComponent,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Save to localStorage
      localStorage.setItem('react-ide-saved-component', JSON.stringify(componentData));
      
      // Add to history (append to existing history)
      const history = getHistory();
      const newEntry = {
        ...currentComponent,
        timestamp: new Date().toISOString(),
        id: Date.now() // Use unique ID instead of 'saved-component'
      };
      
      // Add new entry to beginning of history, keep last 10
      const updatedHistory = [newEntry, ...history.slice(0, 9)];
      localStorage.setItem('react-ide-history', JSON.stringify(updatedHistory));
      
      toast.success('Component saved to local storage!');
    } catch (error) {
      console.error('Failed to save component:', error);
      toast.error('Failed to save component');
    }
  };

  const loadSavedComponent = () => {
    try {
      const saved = localStorage.getItem('react-ide-saved-component');
      if (saved) {
        const componentData = JSON.parse(saved);
        setCurrentComponent({
          jsxCode: componentData.jsxCode || '',
          cssCode: componentData.cssCode || '',
          componentName: componentData.componentName || 'MyComponent'
        });
        toast.success('Saved component loaded!');
      } else {
        toast.info('No saved component found');
      }
    } catch (error) {
      console.error('Failed to load saved component:', error);
      toast.error('Failed to load saved component');
    }
  };

  const exportComponent = () => {
    try {
      const componentName = currentComponent.componentName || 'Component';
      
      // Create JSX file
      const jsxBlob = new Blob([currentComponent.jsxCode], { type: 'text/javascript' });
      const jsxUrl = URL.createObjectURL(jsxBlob);
      const jsxLink = document.createElement('a');
      jsxLink.href = jsxUrl;
      jsxLink.download = `${componentName}.jsx`;
      jsxLink.click();
      URL.revokeObjectURL(jsxUrl);

      // Create CSS file if there's CSS
      if (currentComponent.cssCode.trim()) {
        const cssBlob = new Blob([currentComponent.cssCode], { type: 'text/css' });
        const cssUrl = URL.createObjectURL(cssBlob);
        const cssLink = document.createElement('a');
        cssLink.href = cssUrl;
        cssLink.download = `${componentName}.css`;
        cssLink.click();
        URL.revokeObjectURL(cssUrl);
      }

      toast.success('Component exported successfully!');
    } catch (error) {
      console.error('Failed to export component:', error);
      toast.error('Failed to export component');
    }
  };

  const showHistory = () => {
    setShowHistoryModal(true);
    // Load history items when modal opens
    setHistoryItems(getHistory());
  };

  const getHistory = () => {
    try {
      const history = localStorage.getItem('react-ide-history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  };

  const addToHistory = (component: Component) => {
    try {
      const history = getHistory();
      const newEntry = {
        ...component,
        timestamp: new Date().toISOString(),
        id: Date.now()
      };
      
      // Keep only last 10 entries
      const updatedHistory = [newEntry, ...history.slice(0, 9)];
      localStorage.setItem('react-ide-history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to add to history:', error);
    }
  };

  const loadFromHistory = (historyItem: any) => {
    setCurrentComponent({
      jsxCode: historyItem.jsxCode || '',
      cssCode: historyItem.cssCode || '',
      componentName: historyItem.componentName || 'MyComponent'
    });
    setShowHistoryModal(false);
    setSelectedHistoryItem(null);
    toast.success('Component loaded from history!');
  };

  const viewHistoryItem = (historyItem: any) => {
    setSelectedHistoryItem(historyItem);
  };

  const deleteFromHistory = (id: string | number) => {
    try {
      // Update localStorage
      const history = getHistory();
      const updatedHistory = history.filter((item: any) => item.id !== id);
      
      localStorage.setItem('react-ide-history', JSON.stringify(updatedHistory));
      
      // Update UI state immediately
      setHistoryItems(updatedHistory);
      
      // Clear selected item if it was the deleted one
      if (selectedHistoryItem?.id === id) {
        setSelectedHistoryItem(null);
      }
      
      toast.success('Item removed from history');
    } catch (error) {
      console.error('Failed to delete from history:', error);
      toast.error('Failed to delete from history');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">React Component IDE</h1>
            <p className="text-gray-400 text-sm">Write, edit, and preview React components</p>
          </div>
                     <div className="flex items-center gap-3">
             <Button
               variant="outline"
               size="sm"
               onClick={createNewComponent}
               className="gap-2"
             >
               New Component
             </Button>
             <Button
               variant="outline"
               size="sm"
               onClick={clearWorkspace}
               className="gap-2"
             >
               Clear
             </Button>
             <Button
               variant="outline"
               size="sm"
               onClick={saveComponent}
               className="gap-2"
             >
               Save
             </Button>
             <Button
               variant="outline"
               size="sm"
               onClick={showHistory}
               className="gap-2"
             >
               History
             </Button>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Code Editor */}
        <div className="w-1/2 border-r border-gray-700">
          <CodeEditor
            jsxCode={currentComponent.jsxCode}
            cssCode={currentComponent.cssCode}
            onCodeChange={handleCodeChange}
          />
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2">
          <ComponentPreview
            jsxCode={currentComponent.jsxCode}
            cssCode={currentComponent.cssCode}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 p-2 text-sm text-gray-400">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>Ready to code! Write your React components and see them live.</span>
            {currentComponent.jsxCode && (
              <span>JSX: {currentComponent.jsxCode.length} chars</span>
            )}
            {currentComponent.cssCode && (
              <span>CSS: {currentComponent.cssCode.length} chars</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>Auto-save enabled</span>
            <span>Created by Aniket</span>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-4/5 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-white">Component History</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedHistoryItem(null);
                }}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Close
              </Button>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                             {/* History List */}
               <div className="w-1/3 overflow-y-auto">
                 {historyItems.length === 0 ? (
                   <div className="text-center py-8 text-gray-400">
                     <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                     <p>No saved components found</p>
                     <p className="text-sm">Save components to see them here</p>
                   </div>
                 ) : (
                   <div className="space-y-3">
                     {historyItems.map((item: any) => (
                      <div 
                        key={item.id} 
                        className={`bg-gray-700 rounded-lg p-4 border cursor-pointer transition-colors ${
                          selectedHistoryItem?.id === item.id 
                            ? 'border-primary bg-gray-600' 
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => viewHistoryItem(item)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-white">{item.componentName}</h3>
                            <p className="text-sm text-gray-400">
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                loadFromHistory(item);
                              }}
                              className="gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Load
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteFromHistory(item.id);
                              }}
                              className="gap-1 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-300">
                          <span>JSX: {item.jsxCode.length} chars</span>
                          {item.cssCode && (
                            <span className="ml-4">CSS: {item.cssCode.length} chars</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Code Preview */}
              <div className="w-2/3 bg-gray-900 rounded-lg overflow-hidden">
                {selectedHistoryItem ? (
                  <div className="h-full flex flex-col">
                    <div className="bg-gray-800 p-3 border-b border-gray-700">
                      <h3 className="text-white font-semibold">{selectedHistoryItem.componentName}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(selectedHistoryItem.timestamp).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex-1 flex">
                      {/* JSX Code */}
                      <div className="w-1/2 border-r border-gray-700">
                        <div className="bg-gray-800 p-2 border-b border-gray-700">
                          <span className="text-sm font-medium text-white">JSX/TSX</span>
                        </div>
                        <div className="h-full overflow-auto">
                          <pre className="text-sm text-gray-300 p-4 font-mono whitespace-pre-wrap">
                            {selectedHistoryItem.jsxCode || '// No JSX code found'}
                          </pre>
                        </div>
                      </div>
                      
                      {/* CSS Code */}
                      <div className="w-1/2">
                        <div className="bg-gray-800 p-2 border-b border-gray-700">
                          <span className="text-sm font-medium text-white">CSS</span>
                        </div>
                        <div className="h-full overflow-auto">
                          <pre className="text-sm text-gray-300 p-4 font-mono whitespace-pre-wrap">
                            {selectedHistoryItem.cssCode || '/* No CSS code found */'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <FileCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a component to view its code</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};