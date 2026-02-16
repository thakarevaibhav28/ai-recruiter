import { Route, BrowserRouter as Router, Routes} from "react-router-dom";
import Dashboard from "../pages/admin/adminDashboard";
// import AdminLayout from "../common/AdminLayout";

const AdminRoutes = () => {
  return (
    <Router>
      <Routes>

      <Route path="/" element={<Dashboard/>}/>

      </Routes>
    </Router>
  );
};

export default AdminRoutes;
