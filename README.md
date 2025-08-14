# KFlow - Knowledge Management & AI-Powered Notes

A modern React-based knowledge management application that allows users to create, edit, delete, and search through their notes. Features AI-powered note generation using OpenAI's API.

## Features

- 📝 **Note Management**: Create, edit, and delete notes with a clean interface
- 🔍 **Search Functionality**: Search through notes by title and content
- 🤖 **AI Integration**: Generate notes on the fly using OpenAI's GPT models
- 💾 **Local Storage**: Notes are automatically saved to browser localStorage
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI**: Beautiful, intuitive interface with smooth animations

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: CSS3 with modern design principles
- **Icons**: Lucide React
- **AI Integration**: OpenAI API
- **Backend**: Express.js server
- **Storage**: Browser localStorage + optional backend persistence

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (for AI features)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd kflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env and add your OpenAI API key
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3001
   ```

4. **Start the development server**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start them separately:
   npm run start        # Frontend only
   npm run server:dev   # Backend only
   ```

## Usage

### Creating Notes
- Click the "+" button in the sidebar to create a new note
- Use the AI Generator to create notes with AI assistance
- Type your content and click "Save"

### Editing Notes
- Click on any note in the sidebar to view it
- Click the "Edit" button to modify the note
- Make your changes and click "Save"

### Searching Notes
- Use the search bar at the top of the sidebar
- Search by title or content
- Results update in real-time

### AI Note Generation
- Enter a description of the note you want in the AI Generator
- Click "Generate Note" to create AI-powered content
- Try the example prompts for inspiration

## API Endpoints

- `POST /api/generate-note` - Generate notes using AI
- `GET /api/health` - Health check endpoint

## Project Structure

```
kflow/
├── src/
│   ├── components/
│   │   ├── NoteList.tsx      # Note list sidebar
│   │   ├── NoteEditor.tsx    # Note editing interface
│   │   ├── SearchBar.tsx     # Search functionality
│   │   └── AIGenerator.tsx   # AI integration
│   ├── types/
│   │   └── Note.ts           # TypeScript interfaces
│   ├── App.tsx               # Main application component
│   └── App.css               # Application styles
├── server.js                 # Express backend server
├── package.json              # Frontend dependencies
└── env.example               # Environment variables template
```

## Configuration

### OpenAI API Setup
1. Get your API key from [OpenAI Platform](https://platform.openai.com/)
2. Add it to your `.env` file
3. The AI features will automatically be enabled

### Customization
- Modify the AI prompt in `server.js` to change how notes are generated
- Adjust the styling in `src/App.css`
- Add new note types or fields in `src/types/Note.ts`

## Development

### Available Scripts
- `npm start` - Start the React development server
- `npm run build` - Build the app for production
- `npm run server` - Start the backend server
- `npm run server:dev` - Start the backend with nodemon
- `npm run dev` - Start both frontend and backend in development mode

### Adding New Features
1. Create new components in `src/components/`
2. Add TypeScript interfaces in `src/types/`
3. Update the main App component as needed
4. Style your components in `App.css`

## Deployment

### Frontend
```bash
npm run build
# Deploy the build/ folder to your hosting service
```

### Backend
```bash
npm run server
# Deploy to your preferred hosting service (Heroku, Vercel, etc.)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

If you encounter any issues or have questions:
1. Check the console for error messages
2. Verify your OpenAI API key is correct
3. Ensure all dependencies are installed
4. Check that both frontend and backend are running

## Future Enhancements

- [ ] User authentication and cloud sync
- [ ] Note categories and tags
- [ ] Rich text editing
- [ ] Note sharing and collaboration
- [ ] Advanced AI features (summarization, translation)
- [ ] Mobile app
- [ ] Export/import functionality
