import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Layouts/Sidebar';
import Login from './components/Layouts/Login';
import EventList from './components/Events/EventList';
import EventCreate from './components/Events/EventCreate';
import Charts from './components/Layouts/Charts';
import Wordtag from './components/Layouts/Wordtag';
import Attendance from './components/Layouts/Attendance';
import CalendarComponent from './components/Layouts/Calendar';
import ProtectedRoute from './ProtectedRoute';
import EventUpdate from './components/Events/EventUpdate';
import EventModal from './components/Events/EventModal';
import CreateQuestionnaire from './components/Events/CreateQuestionnaire';
import ViewQuestionnaire from './components/Events/ViewQuestionnaire';
import ViewReports from './components/Events/ViewReports';
import AttendanceChart from './components/Layouts/AttendanceChart';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route for Login */}
        <Route path="/" element={<Login />} />

        {/* Protected route for the dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><Sidebar /></ProtectedRoute>}>
          {/* Nested routes inside protected route */}
          <Route path="events" element={<ProtectedRoute><EventList /></ProtectedRoute>} />
          <Route path="createevents" element={<ProtectedRoute><EventCreate /></ProtectedRoute>} />
          <Route path="updateevents/:eventId" element={<ProtectedRoute><EventUpdate /></ProtectedRoute>} />
          <Route path="charts" element={<ProtectedRoute><Charts /></ProtectedRoute>} />
          <Route path="wordtag" element={<ProtectedRoute><Wordtag /></ProtectedRoute>} />
          <Route path="attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="calendar" element={<ProtectedRoute><CalendarComponent /></ProtectedRoute>} />
          <Route path="modal" element={<ProtectedRoute><EventModal /></ProtectedRoute>} />
          <Route path="createquestionnaire" element={<ProtectedRoute><CreateQuestionnaire /></ProtectedRoute>} />
          <Route path="viewquestions" element={<ProtectedRoute><ViewQuestionnaire /></ProtectedRoute>} />
          <Route path="viewreports" element={<ProtectedRoute><ViewReports /></ProtectedRoute>} />
          <Route path="attendancechart" element={<ProtectedRoute><AttendanceChart /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
