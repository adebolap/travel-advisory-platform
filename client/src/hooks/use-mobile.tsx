import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Hook to determine if the screen size is mobile.
 * This uses window.matchMedia to listen for viewport size changes.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(mql.matches);
    };

    mql.addEventListener("change", onChange);
    onChange(); // Set initial state based on the media query

    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []);

  return !!isMobile;
}
