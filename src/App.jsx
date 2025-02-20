import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "./components/Layouts/Sidebar";
import Login from "./components/Layouts/Login";
import EventList from "./components/Events/EventList";
import EventCreate from "./components/Events/EventCreate";
import Charts from "./components/Layouts/Charts";
import Wordtag from "./components/Layouts/Wordtag";
import Attendance from "./components/Layouts/Attendance";
import CalendarComponent from "./components/Layouts/Calendar";
import ProtectedRoute from "./ProtectedRoute";
import EventUpdate from "./components/Events/EventUpdate";
import EventModal from "./components/Events/EventModal";
import CreateQuestionnaire from "./components/Events/CreateQuestionnaire";
import ViewQuestionnaire from "./components/Events/ViewQuestionnaire";
import ViewReports from "./components/Events/ViewReports";
import AttendanceChart from "./components/Layouts/AttendanceChart";
import ListTraits from "./components/Question/ListTraits";
import ListQuestion from "./components/Question/ListQuestion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./components/Loader";
import HomeScreen from "./components/Screen/HomeScreen";
import Header from "./components/Screen/Header";
import Events from "./components/Screen/Events";

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <AppContent loading={loading} user={user} />
    </Router>
  );
}

function AppContent({ loading, user }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/dashboard");
  const isLoginRoute = location.pathname === "/login";

  return (
    <>
      <ToastContainer />
      {loading ? (
        <Loader />
      ) : (
        <>
          {!isAdminRoute && !isLoginRoute && <Header user={user} />}
          <div className={!isAdminRoute && !isLoginRoute ? "mt-20" : ""}>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomeScreen />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/events" element={<Events />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Sidebar />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="events"
                  element={
                    <ProtectedRoute>
                      <EventList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="createevents"
                  element={
                    <ProtectedRoute>
                      <EventCreate />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="updateevents/:eventId"
                  element={
                    <ProtectedRoute>
                      <EventUpdate />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="charts"
                  element={
                    <ProtectedRoute>
                      <Charts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="wordtag"
                  element={
                    <ProtectedRoute>
                      <Wordtag />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="attendance"
                  element={
                    <ProtectedRoute>
                      <Attendance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="calendar"
                  element={
                    <ProtectedRoute>
                      <CalendarComponent />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="modal"
                  element={
                    <ProtectedRoute>
                      <EventModal />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="createquestionnaire"
                  element={
                    <ProtectedRoute>
                      <CreateQuestionnaire />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="viewquestions"
                  element={
                    <ProtectedRoute>
                      <ViewQuestionnaire />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="viewreports"
                  element={
                    <ProtectedRoute>
                      <ViewReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="attendancechart"
                  element={
                    <ProtectedRoute>
                      <AttendanceChart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="trait"
                  element={
                    <ProtectedRoute>
                      <ListTraits />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="questions"
                  element={
                    <ProtectedRoute>
                      <ListQuestion />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </div>
        </>
      )}
    </>
  );
}

export default App;