import "../styles/Badge.scss";

import React from "react";

export function Badge(props: { errorCount: number }) {
  return props.errorCount !== undefined ? (
    <span className="notification-badge">{props.errorCount}</span>
  ) : (
    <></>
  );
}
