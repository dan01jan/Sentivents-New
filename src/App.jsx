import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./ProtectedRoute";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import { ToastContainer } from "react-toastify";

// Officer Dashboard
import AttendanceChart from "./components/Officers/Dashboard/AttendanceChart";
import Attendance from "./components/Officers/Dashboard/Attendance";
import Sidebar from "./components/Officers/Dashboard/Sidebar";
import Charts from "./components/Officers/Dashboard/Charts";
import CalendarComponent from "./components/Officers/Dashboard/Calendar";
import Wordtag from "./components/Officers/Dashboard/Wordtag";

// Officer Events
import CreateQuestionnaire from "./components/Officers/Events/CreateQuestionnaire";
import EventList from "./components/Officers/Events/EventList";
import EventCreate from "./components/Officers/Events/EventCreate";
import EventModal from "./components/Officers/Events/EventModal";
import EventUpdate from "./components/Officers/Events/EventUpdate";
import ViewQuestionnaire from "./components/Officers/Events/ViewQuestionnaire";
import ViewReports from "./components/Officers/Events/ViewReports";

// Officer Question
import ListTraits from "./components/Officers/Question/ListTraits";
import ListQuestion from "./components/Officers/Question/ListQuestion";

// Layouts
import Login from "./components/Layouts/Login";
import Loader from "./components/Layouts/Loader";
import Header from "./components/Layouts/Header";
import Register from "./components/Layouts/Register";

// User
import HomeScreen from "./components/User/HomeScreen";
import Events from "./components/User/Events";
import About from "./components/User/About";
import Organization from "./components/User/Organization";
import OrgDetails from "./components/User/OrgDetails";
import Home from "./components/Officers/Dashboard/Home";

// Admin
import AdminDashboard from "./components/Admin/Dashboard/AdminDashboard";
import AdminSidebar from "./components/Admin/Dashboard/AdminSidebar";
import OrgCreate from "./components/Admin/Organization/OrgCreate";
import AdminOrg from "./components/Admin/Organization/Organization";
import AdminEventList from "./components/Admin/Events/AdminEventList";
import OrgUpdate from "./components/Admin/Organization/OrgUpdate";

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
  const isOfficerRoute = location.pathname.startsWith("/dashboard");
  const isLoginRoute = location.pathname === "/login";
  const isRegisterRoute = location.pathname === "/register";
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <ToastContainer />
      {loading ? (
        <Loader />
      ) : (
        <>
          {!isOfficerRoute &&
            !isLoginRoute &&
            !isRegisterRoute &&
            !isAdminRoute && <Header user={user} />}
          <div
            className={
              !isOfficerRoute &&
              !isLoginRoute &&
              !isRegisterRoute &&
              !isAdminRoute
                ? "mt-20"
                : ""
            }
          >
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
              <Route path="/register" element={<Register />} />
              <Route path="/events" element={<Events />} />
              <Route path="/about" element={<About />} />
              <Route path="/organization" element={<Organization />} />
              <Route path="/organization/:id" element={<OrgDetails />} />
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
                  path=""
                  element={
                    <ProtectedRoute>
                      <Home />
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
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminSidebar />
                  </ProtectedAdminRoute>
                }
              >
                <Route
                  path="admindashboard"
                  element={
                    <ProtectedAdminRoute>
                      <AdminDashboard />
                    </ProtectedAdminRoute>
                  }
                />
                 <Route
                  path="organization"
                  element={
                    <ProtectedAdminRoute>
                      <AdminOrg />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="eventlist"
                  element={
                    <ProtectedAdminRoute>
                      <AdminEventList />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="create"
                  element={
                    <ProtectedAdminRoute>
                      <OrgCreate />
                    </ProtectedAdminRoute>
                  }
                />
                 <Route
                  path="update"
                  element={
                    <ProtectedAdminRoute>
                      <OrgUpdate />
                    </ProtectedAdminRoute>
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
