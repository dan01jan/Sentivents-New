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
import OrgLoginModal from "./components/Layouts/OrgLoginModal";
import ForgotPassword from "./components/Layouts/Forgot-Password";
import ResetPassword from "./components/Layouts/ResetPassword";

// User
import HomeScreen from "./components/User/HomeScreen";
import Events from "./components/User/Events";
import About from "./components/User/About";
import Organization from "./components/User/Organization";
import OrgDetails from "./components/User/OrgDetails";
import Home from "./components/Officers/Dashboard/Home";
import OTP from "./components/User/OTP";

// Admin
import AdminDashboard from "./components/Admin/Dashboard/AdminDashboard";
import AdminSidebar from "./components/Admin/Dashboard/AdminSidebar";
import OrgCreate from "./components/Admin/Organization/OrgCreate";
import AdminOrg from "./components/Admin/Organization/Organization";
import AdminEventList from "./components/Admin/Events/AdminEventList";
import OrgUpdate from "./components/Admin/Organization/OrgUpdate";
import AdminApproval from "./components/Admin/Dashboard/AdminApproval";
import OrgOfficerUpdate from "./components/Admin/Organization/OrgOfficerUpdate";
import AdminEventCreate from "./components/Admin/Events/AdminEventCreate";
import AdminCreateQuestionnaire from "./components/Admin/Events/AdminCreateQuestionnaire";
import AdminEventModal from "./components/Admin/Events/AdminEventModal";
import AdminEventUpdate from "./components/Admin/Events/AdminEventUpdate";
import AdminViewQuestionnaire from "./components/Admin/Events/AdminViewQuestionnaire";
import AdminViewReports from "./components/Admin/Events/AdminViewReports";
import AdminAttendanceChart from "./components/Admin/Dashboard/AdminAttendanceChart";
import AdminEventRegister from "./components/Admin/Events/AdminEventRegister";
import AdminQuestions from "./components/Admin/Dashboard/AdminQuestions";
import CreateLocation from "./components/Admin/Location/CreateLocation";
import LocationList from "./components/Admin/Location/LocationList";
import { AuthProvider } from "./components/Layouts/AuthContext";

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
    <AuthProvider>
      <Router>
        {loading ? <Loader /> : <AppContent loading={loading} user={user} />}
      </Router>
    </AuthProvider>
  );
}

function AppContent({ loading, user }) {
  const location = useLocation();
  const isOfficerRoute = location.pathname.startsWith("/dashboard");
  const isLoginRoute = location.pathname === "/login";
  const isRegisterRoute = location.pathname === "/register";
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isForgotPasswordRoute = location.pathname.startsWith("/forgot-password");

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
            !isAdminRoute &&
            !isForgotPasswordRoute && <Header user={user} />}
          <div
            className={
              !isOfficerRoute &&
                !isLoginRoute &&
                !isRegisterRoute &&
                !isAdminRoute &&
                !isForgotPasswordRoute
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
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/org-login" element={<OrgLoginModal />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events" element={<Events />} />
              <Route path="/otp" element={<OTP />} />
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
                  path="eventcreate"
                  element={
                    <ProtectedAdminRoute>
                      <AdminEventCreate />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="eventupdate/:eventId"
                  element={
                    <ProtectedAdminRoute>
                      <AdminEventUpdate />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="eventmodal"
                  element={
                    <ProtectedAdminRoute>
                      <AdminEventModal />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="attendancechart"
                  element={
                    <ProtectedAdminRoute>
                      <AdminAttendanceChart />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="createquestionnaire"
                  element={
                    <ProtectedAdminRoute>
                      <AdminCreateQuestionnaire />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="viewquestions"
                  element={
                    <ProtectedAdminRoute>
                      <AdminViewQuestionnaire />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="adminquestions"
                  element={
                    <ProtectedAdminRoute>
                      <AdminQuestions />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="createlocation"
                  element={
                    <ProtectedAdminRoute>
                      <CreateLocation />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="location"
                  element={
                    <ProtectedAdminRoute>
                      <LocationList />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="viewreports"
                  element={
                    <ProtectedAdminRoute>
                      <AdminViewReports />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="eventregister/:eventId"
                  element={
                    <ProtectedAdminRoute>
                      <AdminEventRegister />
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
                <Route
                  path="approval"
                  element={
                    <ProtectedAdminRoute>
                      <AdminApproval />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="officerupdate"
                  element={
                    <ProtectedAdminRoute>
                      <OrgOfficerUpdate />
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
