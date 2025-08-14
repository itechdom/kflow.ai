import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import NotePage from './components/NotePage';
import { Note } from './types/Note';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  console.log("Notes from App",notes);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('kflow-notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      // Add sample notes to demonstrate the mind map with nested relationships
      const sampleNotes: Note[] = [
        {
          id: '1',
          title: 'Web Development',
          content: 'Comprehensive guide to modern web development covering frontend, backend, and database technologies.',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          tags: ['web', 'development', 'programming'],
          parentId: undefined,
          children: ['2', '3', '4', '5'],
          level: 0
        },
        {
          id: '2',
          title: 'Frontend Development',
          content: 'Building user interfaces with modern technologies like React, Vue, and Angular.',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          tags: ['frontend', 'ui', 'react', 'javascript'],
          parentId: '1',
          children: ['6', '7'],
          level: 1
        },
        {
          id: '3',
          title: 'Backend Development',
          content: 'Server-side development with Node.js, Python, and other backend technologies.',
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
          tags: ['backend', 'server', 'nodejs', 'python'],
          parentId: '1',
          children: ['8', '9'],
          level: 1
        },
        {
          id: '4',
          title: 'Database Systems',
          content: 'Understanding different database types and design principles.',
          createdAt: new Date('2024-01-04'),
          updatedAt: new Date('2024-01-04'),
          tags: ['database', 'sql', 'nosql', 'design'],
          parentId: '1',
          children: ['10', '11'],
          level: 1
        },
        {
          id: '5',
          title: 'DevOps & Deployment',
          content: 'Continuous integration, deployment, and infrastructure management.',
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-05'),
          tags: ['devops', 'deployment', 'ci-cd', 'infrastructure'],
          parentId: '1',
          children: ['12', '13'],
          level: 1
        },
        {
          id: '6',
          title: 'React Fundamentals',
          content: 'React is a JavaScript library for building user interfaces. It uses components, JSX, and state management to create interactive UIs.',
          createdAt: new Date('2024-01-06'),
          updatedAt: new Date('2024-01-06'),
          tags: ['react', 'javascript', 'frontend', 'components'],
          parentId: '2',
          children: [],
          level: 2
        },
        {
          id: '7',
          title: 'TypeScript Basics',
          content: 'TypeScript adds static typing to JavaScript, making code more reliable and maintainable.',
          createdAt: new Date('2024-01-07'),
          updatedAt: new Date('2024-01-07'),
          tags: ['typescript', 'javascript', 'programming', 'frontend'],
          parentId: '2',
          children: [],
          level: 2
        },
        {
          id: '8',
          title: 'Node.js Development',
          content: 'Node.js allows JavaScript to run on the server side with an event-driven architecture.',
          createdAt: new Date('2024-01-08'),
          updatedAt: new Date('2024-01-08'),
          tags: ['nodejs', 'javascript', 'backend', 'server'],
          parentId: '3',
          children: [],
          level: 2
        },
        {
          id: '9',
          title: 'API Design',
          content: 'RESTful APIs and GraphQL for building robust backend services.',
          createdAt: new Date('2024-01-09'),
          updatedAt: new Date('2024-01-09'),
          tags: ['api', 'rest', 'graphql', 'backend'],
          parentId: '3',
          children: [],
          level: 2
        },
        {
          id: '10',
          title: 'SQL Databases',
          content: 'Relational databases with SQL for structured data storage and querying.',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
          tags: ['sql', 'database', 'relational', 'mysql'],
          parentId: '4',
          children: [],
          level: 2
        },
        {
          id: '11',
          title: 'NoSQL Databases',
          content: 'Document-based and key-value stores for flexible data modeling.',
          createdAt: new Date('2024-01-11'),
          updatedAt: new Date('2024-01-11'),
          tags: ['nosql', 'database', 'mongodb', 'redis'],
          parentId: '4',
          children: [],
          level: 2
        },
        {
          id: '12',
          title: 'Docker & Containers',
          content: 'Containerization for consistent deployment across different environments.',
          createdAt: new Date('2024-01-12'),
          updatedAt: new Date('2024-01-12'),
          tags: ['docker', 'containers', 'deployment', 'devops'],
          parentId: '5',
          children: [],
          level: 2
        },
        {
          id: '13',
          title: 'CI/CD Pipelines',
          content: 'Automated testing and deployment workflows for reliable software delivery.',
          createdAt: new Date('2024-01-13'),
          updatedAt: new Date('2024-01-13'),
          tags: ['ci-cd', 'pipeline', 'testing', 'deployment'],
          parentId: '5',
          children: [],
          level: 2
        }
      ];
      setNotes(sampleNotes);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    console.log("SET NOTES",notes);
    localStorage.setItem('kflow-notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (note: Note) => {
    setNotes([note, ...notes]);
    setSelectedNote(note);
    setIsEditing(true);
  };

  const addChildNote = (parentNote: Note) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Child Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      parentId: parentNote.id,
      children: [],
      level: parentNote.level + 1
    };
    
    setNotes([...notes, newNote]);
    setSelectedNote(newNote);
    setIsEditing(true);
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      parentId: undefined,
      children: [],
      level: 0
    };
    addNote(newNote);
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    ));
    setSelectedNote(updatedNote);
    setIsEditing(false);
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage
              notes={notes}
              selectedNote={selectedNote}
              onSelectNote={setSelectedNote}
              onDeleteNote={deleteNote}
              onEditNote={() => setIsEditing(true)}
              onAddChildNote={addChildNote}
              onCreateNote={createNewNote}
              onUpdateNote={updateNote}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
          } 
        />
        <Route 
          path="/note/:noteId" 
          element={
            <NotePage
              notes={notes}
              selectedNote={selectedNote}
              onSelectNote={setSelectedNote}
              onDeleteNote={deleteNote}
              onEditNote={() => setIsEditing(true)}
              onAddChildNote={addChildNote}
              onCreateNote={createNewNote}
              onUpdateNote={updateNote}
            />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
