import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Reset scroll on navigation so every page starts at the top.
 *  Hash links (e.g. /#safety-heading) are left for the browser to handle. */
const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) return;

        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname, hash]);

    return null;
};

export default ScrollToTop;
