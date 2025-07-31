# React Component IDE

A clean, simple React IDE for writing and previewing React components with live editing.

## Features

- **Live Preview**: See your components render in real-time
- **Code Editor**: Edit JSX and CSS with syntax highlighting
- **Responsive Design**: Preview components at different screen sizes
- **Export Options**: Download your components as files
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Fullscreen Preview**: Toggle fullscreen mode for better viewing
- **Auto-save**: Changes are automatically saved as you type

## How to Edit

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-react-canvas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## Technologies Used

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Reusable UI components

## Usage

1. **Write Code**: Use the code editor to write JSX and CSS
2. **Live Preview**: See your component render instantly in the preview panel
3. **New Component**: Click "New Component" to start with a template
4. **Clear Workspace**: Click "Clear" to start fresh
5. **Save**: Click "Save" to log your component data to console
6. **Fullscreen**: Use the fullscreen button in the preview for better viewing

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── CodeEditor.tsx # Code editing component
│   ├── ComponentPreview.tsx # Live preview
│   └── ui/            # shadcn/ui components
├── pages/             # Page components
└── hooks/             # Custom React hooks
```

### Adding New Features

1. **UI Components**: Add new components in `src/components/`
2. **Styling**: Use Tailwind CSS classes or add custom CSS
3. **Functionality**: Extend the existing components or create new ones

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy!

### Other Platforms

The app can be deployed to any static hosting service:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any other static hosting service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own applications.
