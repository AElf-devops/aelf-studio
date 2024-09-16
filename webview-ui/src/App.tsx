import React from 'react';
import { vscode } from "./utilities/vscode";
import {createComponent} from '@lit/react';
import {VscodeButton} from "@vscode-elements/elements/dist/vscode-button/index.js";
import "./App.css";

export const Button = createComponent({
  tagName: 'vscode-button',
  elementClass: VscodeButton,
  react: React,
  events: {
    onactivate: 'activate',
    onchange: 'change',
  },
});

function App() {
  function handleBuild() {
    vscode.postMessage({
      command: "hello",
      text: "Hey there partner! 🤠",
    });
  }

  return (
    <main>
      <h1>Welcome to aelf Studio</h1>
      <Button onClick={handleBuild}>Build</Button>
    </main>
  );
}

export default App;