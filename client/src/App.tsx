import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import PublicMusicLinkPage from './pages/PublicMusicLinkPage';
import AnalyticsReportPage from './pages/AnalyticsReportPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/music-link/:id" element={<PublicMusicLinkPage />} />
      <Route path="/music-link/:id/report" element={<AnalyticsReportPage />} />
    </Routes>
  );
}