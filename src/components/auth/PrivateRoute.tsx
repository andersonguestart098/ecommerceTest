import React from "react";
import { Route, Navigate } from "react-router-dom";

const PrivateRoute = ({ component: Component, ...rest }: any) => {
  const token = localStorage.getItem("token");
  return (
    <Route
      {...rest}
      render={(props: any) =>
        token ? <Component {...props} /> : <Navigate to="/login" />
      }
    />
  );
};

export default PrivateRoute;
