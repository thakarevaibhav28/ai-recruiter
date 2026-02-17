import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAppContext } from "../contexts/contexts";
import { useEffect, useState } from "react";


/* ✅ Move ProtectedRoute OUTSIDE the component */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // ✅ Fixed: Check both sessionStorage and sessionStorage for token
  const token = sessionStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
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
