import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RoomProvider } from './RoomContext';
import Landing from './routes/Landing';
import Teacher from './routes/Teacher';
import Student from './routes/Student';

export default function App() {
  return (
    <RoomProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/student" element={<Student />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </RoomProvider>
  );
}
