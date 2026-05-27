import * as React from "react";

const MOBILE_BREAKPOINT = 768;

const getIsMobile = () => {
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
};

const getServerSnapshot = () => false;

const subscribeToMobileChanges = (callback: () => void) => {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

  if (mql.addEventListener) {
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  }

  mql.addListener(callback);
  return () => mql.removeListener(callback);
};

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribeToMobileChanges,
    getIsMobile,
    getServerSnapshot
  );
}
