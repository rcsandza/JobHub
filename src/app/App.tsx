import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TopBar } from './components/TopBar';
import { JobDetail } from './components/JobDetail';
import { JobsList } from './components/JobsList';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-background">
        <TopBar />
        <main className="flex-1">
          <Routes>
            {/* Jobs list as home page */}
            <Route path="/" element={<JobsList />} />
            {/* Route that captures the entire path after /job/ as the slug */}
            <Route path="/job/*" element={<JobDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}