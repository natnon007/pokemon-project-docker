import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

const container = document.getElementById('root'); // Your root container
const root = ReactDOM.createRoot(container); // Create a root

root.render(<App />, document.getElementById("root"));
