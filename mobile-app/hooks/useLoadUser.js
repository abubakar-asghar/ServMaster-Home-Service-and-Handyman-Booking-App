import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";
import { getUserFromStorage } from "../utils/storage";

export const useLoadUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUserFromStorage();
      if (userData) {
        dispatch(setCredentials(userData));
      }
    };
    loadUser();
  }, []);
};
