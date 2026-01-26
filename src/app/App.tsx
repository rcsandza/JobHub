import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { JobDetail } from './components/JobDetail';
import { JobsList } from './components/JobsList';
import { SuccessPage } from './components/SuccessPage';
import { PassphraseGuard } from './components/PassphraseGuard';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <Routes>
            {/* Jobs list as home page */}
            <Route path="/" element={<PassphraseGuard><JobsList /></PassphraseGuard>} />
            {/* Route that captures the entire path after /job/ as the slug */}
            <Route path="/job/*" element={<JobDetail />} />
            {/* Application success page */}
            <Route path="/success" element={<SuccessPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}