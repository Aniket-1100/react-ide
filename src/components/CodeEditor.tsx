import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Download, FileCode, FileText, Save, Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  jsxCode: string;
  cssCode: string;
  componentName: string;
  onCodeChange?: (jsxCode: string, cssCode: string) => void;
}

const defaultTemplates = {
  'Empty Component': {
    jsx: `function MyComponent() {
  return (
    <div>
      <h1>Hello World!</h1>
      <p>Start coding your component here...</p>
    </div>
  );
}`,
    css: `/* Add your CSS styles here */
.my-component {
  padding: 20px;
  text-align: center;
}`
  },
  'Interactive Counter': {
    jsx: `function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  );
}`,
    css: `.counter {
  text-align: center;
  padding: 2rem;
  max-width: 400px;
  margin: 0 auto;
}

.counter h2 {
  color: #333;
  margin-bottom: 1rem;
}

.counter button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  margin: 0 8px;
  border-radius: 4px;
  cursor: pointer;
}

.counter button:hover {
  background: #0056b3;
}`
  },
  'User Card': {
    jsx: `function UserCard() {
  return (
    <div className="user-card">
      <img 
        src="https://via.placeholder.com/100" 
        alt="User Avatar" 
        className="avatar"
      />
      <h3>John Doe</h3>
      <p>Software Engineer</p>
      <p>Passionate about building scalable web applications</p>
      <button className="follow-btn">Follow</button>
      <button className="message-btn">Message</button>
    </div>
  );
}`,
    css: `.user-card {
  max-width: 300px;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  background: white;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.user-card h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.user-card p {
  margin: 0 0 1rem 0;
  color: #666;
}

.follow-btn {
  background-color: #1e40af;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  margin-right: 8px;
  cursor: pointer;
}

.follow-btn:hover {
  background-color: #1d4ed8;
}

.message-btn {
  background-color: #f1f5f9;
  color: #1e293b;
  border: 1px solid #cbd5e1;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.message-btn:hover {
  background-color: #e2e8f0;
}`
  },
  'Contact Form': {
    jsx: `function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h2>Contact Us</h2>
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows="4"
          required
        />
      </div>
      <button type="submit">Send Message</button>
    </form>
  );
}`,
    css: `.contact-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.contact-form h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.contact-form button {
  width: 100%;
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.contact-form button:hover {
  background: #0056b3;
}`
  }
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  jsxCode,
  cssCode,
  componentName,
  onCodeChange
}) => {
  const [activeTab, setActiveTab] = useState('jsx');
  const [localJsxCode, setLocalJsxCode] = useState(jsxCode || '');
  const [localCssCode, setLocalCssCode] = useState(cssCode || '');
  const [autoSave, setAutoSave] = useState(true);
  const { toast } = useToast();
  const prevCodeRef = useRef({ jsx: jsxCode, css: cssCode });

  useEffect(() => {
    setLocalJsxCode(jsxCode || '');
    setLocalCssCode(cssCode || '');
    prevCodeRef.current = { jsx: jsxCode, css: cssCode };
  }, [jsxCode, cssCode]);

  useEffect(() => {
    if (!autoSave) return;
    const timer = setTimeout(() => {
      if (
        localJsxCode !== prevCodeRef.current.jsx ||
        localCssCode !== prevCodeRef.current.css
      ) {
        handleSaveChanges();
        prevCodeRef.current = {
          jsx: localJsxCode,
          css: localCssCode
        };
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [localJsxCode, localCssCode, autoSave]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied!',
        description: `${type} code copied to clipboard`
      });
    });
  };

  const downloadCode = () => {
    const jsxBlob = new Blob([localJsxCode], { type: 'text/javascript' });
    const cssBlob = new Blob([localCssCode], { type: 'text/css' });

    const jsxUrl = URL.createObjectURL(jsxBlob);
    const jsxLink = document.createElement('a');
    jsxLink.href = jsxUrl;
    jsxLink.download = `${componentName}.tsx`;
    jsxLink.click();
    URL.revokeObjectURL(jsxUrl);

    if (localCssCode.trim()) {
      const cssUrl = URL.createObjectURL(cssBlob);
      const cssLink = document.createElement('a');
      cssLink.href = cssUrl;
      cssLink.download = `${componentName}.css`;
      cssLink.click();
      URL.revokeObjectURL(cssUrl);
    }

    toast({
      title: 'Downloaded!',
      description: 'Component files downloaded successfully'
    });
  };

  const handleSaveChanges = () => {
    onCodeChange?.(localJsxCode, localCssCode);
    toast({
      title: 'Saved!',
      description: 'Changes saved successfully'
    });
  };

  const loadTemplate = (templateName: string) => {
    const template = defaultTemplates[templateName as keyof typeof defaultTemplates];
    if (template) {
      setLocalJsxCode(template.jsx);
      setLocalCssCode(template.css);
      toast({
        title: 'Template Loaded!',
        description: `${templateName} template loaded successfully`
      });
    }
  };

  const clearCode = () => {
    setLocalJsxCode('');
    setLocalCssCode('');
    toast({
      title: 'Cleared!',
      description: 'Code editor cleared'
    });
  };

  const handleJsxKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const updated = localJsxCode.slice(0, start) + '  ' + localJsxCode.slice(end);
      setLocalJsxCode(updated);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">Code Editor</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoSave(!autoSave)}
              className={cn("gap-2", autoSave && "bg-primary text-primary-foreground")}
            >
              <Save className="w-3 h-3" />
              Auto-save {autoSave ? 'ON' : 'OFF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCode}
              className="gap-2"
            >
              <Terminal className="w-3 h-3" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Templates:</span>
          {Object.keys(defaultTemplates).map((templateName) => (
            <Button
              key={templateName}
              variant="outline"
              size="sm"
              onClick={() => loadTemplate(templateName)}
              className="text-xs h-6 px-2"
            >
              {templateName}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Custom Tab Headers */}
        <div className="px-4 pt-3 flex-shrink-0">
          <div className="grid w-full grid-cols-2 bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveTab('jsx')}
              className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'jsx'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileCode className="w-3 h-3" />
              JSX/TSX
            </button>
            <button
              onClick={() => setActiveTab('css')}
              className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'css'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-3 h-3" />
              CSS
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'jsx' && (
            <div className="h-full bg-gray-900 overflow-auto">
              <textarea
                value={localJsxCode}
                onChange={(e) => setLocalJsxCode(e.target.value)}
                onKeyDown={handleJsxKeyDown}
                className="w-full h-full font-mono text-sm text-white bg-transparent border-0 resize-none focus:outline-none p-4"
                placeholder="Write your JSX/TSX code here..."
                style={{
                  fontFamily: 'Consolas, "Courier New", monospace',
                  lineHeight: '1.6',
                  fontSize: '14px',
                  color: '#ffffff'
                }}
              />
            </div>
          )}

          {activeTab === 'css' && (
            <div className="h-full bg-gray-900 overflow-auto">
              <textarea
                value={localCssCode}
                onChange={(e) => setLocalCssCode(e.target.value)}
                className="w-full h-full font-mono text-sm text-white bg-transparent border-0 resize-none focus:outline-none p-4"
                placeholder="Write your CSS code here..."
                style={{
                  fontFamily: 'Consolas, "Courier New", monospace',
                  lineHeight: '1.6',
                  fontSize: '14px',
                  color: '#ffffff'
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(localJsxCode, 'JSX')}
              className="gap-2"
            >
              <Copy className="w-3 h-3" />
              Copy JSX
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(localCssCode, 'CSS')}
              className="gap-2"
            >
              <Copy className="w-3 h-3" />
              Copy CSS
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCode}
              className="gap-2"
            >
              <Download className="w-3 h-3" />
              Download
            </Button>
            <div className="text-xs text-muted-foreground">Created by Aniket</div>
          </div>
        </div>
      </div>
    </Card>
  );
};