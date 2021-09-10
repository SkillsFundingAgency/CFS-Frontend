import React, { useLayoutEffect, useRef, useState } from "react";

export interface SearchBoxProps {
  timeout?: number;
  callback: any;
}

export function SearchBox(props: SearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState<string>("initialise");
  const didMount = useRef(false);

  useLayoutEffect(() => {
    if (didMount.current) {
      const timeout = setTimeout(() => props.callback(searchQuery), props.timeout ?? 900);
      return () => clearTimeout(timeout);
    } else {
      didMount.current = true;
    }
  }, [searchQuery]);

  return <input className="govuk-input" onChange={(e) => setSearchQuery(e.target.value)} />;
}
