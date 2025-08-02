"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setModalState } from "../store/slices/modalSlice"; // You'll need to create this slice

export const ModalManager = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Make modal functions available globally
    window.openModal = (type, data = null) => {
      dispatch(setModalState({ type, data, isOpen: true }));
    };

    return () => {
      delete window.openModal;
    };
  }, [dispatch]);

  return null;
};
