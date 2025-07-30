import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';

export default function App() {
  return (
    
    <Routes>
      {console.log(import.meta.env.VITE_BACKEND_URL)}
      <Route path="/" element={<HomePage />} />
      <Route path="/chat/:id" element={<ChatPage />} />
    </Routes>
  );
}