"use client";

import queryClient from "../api/queryClient";
import store from "../store/store";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Provider as ReduxProvider } from "react-redux";

const Provider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>{children}</ReduxProvider>
    </QueryClientProvider>
  );
};

export default Provider;
