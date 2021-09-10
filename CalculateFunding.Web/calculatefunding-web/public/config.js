window["configuration"] = fetch("/app/config.json", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
}).then((response) => response.json());
