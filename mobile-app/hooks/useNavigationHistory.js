import { useRouter } from "expo-router";
import { useRef, useEffect } from "react";

export const useNavigationHistory = () => {
  const router = useRouter();
  const history = useRef([]);

  const push = (path) => {
    history.current.push(path);
  };

  const clear = () => {
    history.current = [];
  };

  const replace = (path) => {
    clear(); // Clear history before replacing
    router.replace(path);
  };

  const resetAndPush = (path) => {
    clear();
    router.push(path);
  };

  const back = () => {
    if (history.current.length > 1) {
      history.current.pop(); // Remove current route
      const previousRoute = history.current[history.current.length - 1];
      router.replace(previousRoute);
    } else {
      router.back();
    }
  };

  return {
    push,
    back,
    clear,
    replace,
    resetAndPush,
    currentHistory: history.current,
  };
};
