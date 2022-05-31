import { useReducer, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { LOCAL_STORAGE } from "./constants";
import { reducer, initialState } from "./reducers/main";
import { useLocalStorageAuth } from "./hooks/auth";
import { checkHttpStatus } from "./utils/api/helpers";
import { authSelf } from "./reducers/main";
import { refresh, self } from "./utils/api/auth";
import Templates from "./pages/Templates/List";
import TemplateEdit from "./pages/Templates/Edit";
import TemplateNew from "./pages/Templates/New";

import Connectors from "./pages/Connectors/List";
import ConnectorEdit from "./pages/Connectors/Edit";
import ConnectorNew from "./pages/Connectors/New";

import Profile from "./pages/Profile";
import Signup from "./pages/Auth/Signup";
import Login from "./pages/Auth/Login";

import { ProtectedRouteProps } from "./partials/ProtectedRoute";
import ProtectedRoute from "./partials/ProtectedRoute";

import "./index.css";

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const auth = useLocalStorageAuth();
  const isAuthenticated = !!(auth && Object.keys(auth).length);

  const defaultProtectedRouteProps: Omit<ProtectedRouteProps, 'outlet'> = {
    isAuthenticated: isAuthenticated,
    authenticationPath: '/login',
  };

  useEffect(() => {
    if (isAuthenticated) {
      self()
        .then(checkHttpStatus)
        .then(data => {
          dispatch(authSelf(data));
        })
        .catch(err => {
          // since auth is set in localstorage,
          // try to refresh the existing token,
          // on error clear localstorage
          if (err.status === 401) {
            err.text().then((text: string) => {
              const textObj = JSON.parse(text);
              if (textObj.code === "user_not_found") {
                localStorage.removeItem(LOCAL_STORAGE);
              }
            })

            refresh()
              .then(checkHttpStatus)
              .then(data => {
                const localData = localStorage.getItem(LOCAL_STORAGE);

                if (localData) {
                  const localDataParsed = JSON.parse(localData);
                  if (localDataParsed && Object.keys(localDataParsed).length) {
                    localDataParsed.access_token = data.access;
                    localStorage.setItem(LOCAL_STORAGE, JSON.stringify(localDataParsed))
                  }
                }
              })
              .catch(err => {
                localStorage.removeItem(LOCAL_STORAGE);
              })
          }
        })
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/" element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<Templates dispatch={dispatch} state={state} />} />} />
        <Route path="/templates/new" element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<TemplateNew dispatch={dispatch} state={state} />} />} />
        <Route path="/templates/:id" element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<TemplateEdit dispatch={dispatch} state={state} />} />} />

        <Route path="/connectors" element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<Connectors dispatch={dispatch} state={state} />} />} />
        <Route path="/connectors/new" element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<ConnectorNew dispatch={dispatch} state={state} />} />} />
        <Route path="/connectors/:id" element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<ConnectorEdit dispatch={dispatch} state={state} />} />} />

        <Route path="/profile" element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<Profile dispatch={dispatch} state={state} />} />} />
        <Route path="/signup" element={<Signup dispatch={dispatch} />} />
        <Route path="/login" element={<Login dispatch={dispatch} />} />
      </Routes>
    </div>
  );
}
