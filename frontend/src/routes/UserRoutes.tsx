import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAppContext } from "../contexts/contexts";
import { useEffect, useState } from "react";

import Home from "../pages/user/Home";
import Products from "../pages/user/Products";
import ProductDetails from "../pages/user/Product_Details";
import Profiles from "../pages/user/Profiles";
import Categories from "../pages/user/Categories";
import MobileBlocker from "../components/User/MobileBlocker/MobileBlocker";
import SearchItem from "../components/User/Header/SearchItem";
import LocationPopup from "../components/User/Header/LocationPopup";
import Loader from "../Loader/Loader";
import PrivacyPolicy from "../components/User/Profile/Privacy";
import Help from "../components/User/Profile/Help";
import Terms from "../components/User/Footer/Terms&Condition";
import Shipping from "../components/User/Footer/ShippingPolicy";
import ScrollToTop from "../utils/ScrollToTop";

/* ✅ Move ProtectedRoute OUTSIDE the component */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // ✅ Fixed: Check both sessionStorage and sessionStorage for token
  const token = sessionStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
  const { loading } = useAppContext();

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center h-screen text-gray-600">
        <Loader />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function UserRoutes() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const locationConfirmed = sessionStorage.getItem("locationConfirmed");
    if (!locationConfirmed) {
      setShowLocationPopup(true);
    }
  }, []);

  const handleClosePopup = () => {
    sessionStorage.setItem("locationConfirmed", "true");
    setShowLocationPopup(false);
  };

  return (
    <>
      {showLocationPopup && <LocationPopup onClose={handleClosePopup} />}

      <Router>
        <ScrollToTop />
        <Routes>
          {windowWidth < 1000 ? (
            <>
              <Route path="/" element={<MobileBlocker />} />
              <Route path="/products/:category" element={<MobileBlocker />} />
              <Route path="/categories" element={<MobileBlocker />} />
              <Route path="/product/:id" element={<MobileBlocker />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <MobileBlocker />
                  </ProtectedRoute>
                }
              />
              {/* <Route path="*" element={<MobileBlocker />} /> */}
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/products/:category" element={<Products />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/help-support" element={<Help />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/search" element={<SearchItem />} />
              <Route path="/terms&condition" element={<Terms />} />
              <Route path="/shippingPolicy" element={<Shipping />} />

              {/* ✅ Protected profile route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profiles />
                  </ProtectedRoute>
                }
              />
            </>
          )}
        </Routes>
      </Router>
    </>
  );
}

export default UserRoutes;
