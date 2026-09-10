import { BrowserRouter, Routes, Route } from "react-router-dom";
import ItemDetails from "./pages/ItemDetails";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Items from "./pages/Items";
import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/ReportFound";
import Dashboard from "./pages/Dashboard";
import MyItems from "./pages/MyItems";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import EditItem from "./pages/EditItem";
import Settings from "./pages/Settings";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminClaims from "./pages/AdminClaims";
import AdminItems from "./pages/AdminItems";
import Claim from "./pages/Claim";




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/items" element={<Items />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/items/:id" element={<ItemDetails />} />
        <Route path="/claim/:itemId" element={<Claim />} />


        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-items"
          element={
            <ProtectedRoute>
              <MyItems />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report-lost"
          element={
            <ProtectedRoute>
              <ReportLost />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report-found"
          element={
            <ProtectedRoute>
              <ReportFound />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-item/:id"
          element={
            <ProtectedRoute>
              <EditItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />
        <Route
          path="/admin/claims"
          element={<AdminClaims />}
        />
      <Route
        path="/admin/items"
        element={<AdminItems />}
      />
      </Routes>
    </BrowserRouter>
  );
}

export default App;