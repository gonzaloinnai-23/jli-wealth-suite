import { useEffect, useState } from "react";

/**
 * Parses `window.location.hash` of the form `#tab[/sub]`.
 * Matches the original dashboard which uses URLs like `#resumen/ale`,
 * `#organigrama`, `#alternativos`, etc.
 */
export interface HashRoute {
  tab: string;
  sub: string | null;
}

function parse(): HashRoute {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return { tab: "resumen", sub: null };
  const [tab, sub] = raw.split("/");
  return { tab: tab || "resumen", sub: sub || null };
}

export function useHashRoute(): [HashRoute, (next: Partial<HashRoute>) => void] {
  const [route, setRoute] = useState<HashRoute>(parse);

  useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = (next: Partial<HashRoute>) => {
    const merged: HashRoute = { ...route, ...next };
    const hash = merged.sub ? `#${merged.tab}/${merged.sub}` : `#${merged.tab}`;
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  };

  return [route, navigate];
}
