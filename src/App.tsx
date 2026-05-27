import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RoomProvider } from './RoomContext';
import Landing from './routes/Landing';
import Teacher from './routes/Teacher';
import Student from './routes/Student';
import Preview from './routes/Preview';
import CharacterCheckButton from './components/CharacterCheckButton';
import ReactionBar from './components/ReactionBar';
import ReactionBurst from './components/ReactionBurst';

export default function App() {
  return (
    <RoomProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/student" element={<Student />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ReactionBurst />
        <ReactionBar />
        <CharacterCheckButton />
      </BrowserRouter>
    </RoomProvider>
  );
}
