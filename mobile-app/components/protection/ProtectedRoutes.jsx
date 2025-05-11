import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/auth/login");
    }
  }, [token]);

  return token ? children : null;
};

export default ProtectedRoute;
