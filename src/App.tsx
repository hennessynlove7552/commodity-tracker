import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { queryClient } from './config/queryClient';
import { Dashboard } from './features/dashboard';
import './styles/globals.css';
import './styles/animations.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/commodity-tracker">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/commodity/:id" element={<div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>상세 페이지 (개발 중)</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
