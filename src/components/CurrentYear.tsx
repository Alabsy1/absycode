"use client";

import { useEffect, useState } from "react";

/**
 * Current year that is correct in three situations:
 *  - server HTML (and with JS disabled) shows the year the page was rendered
 *  - after hydration it is refreshed to the visitor's actual current year
 *  - no hydration warning when the build year differs from the client year
 */
export default function CurrentYear({ serverYear }: { serverYear: number }) {
  const [year, setYear] = useState<number>(serverYear);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <span suppressHydrationWarning>{year}</span>;
}
