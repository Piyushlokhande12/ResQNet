import { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe } from "../store/authSlice";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, [token]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);