import React from 'react';
import { vscode } from "./utilities/vscode";
import { createComponent } from '@lit/react';
import { VscodeButton } from "@vscode-elements/elements/dist/vscode-button/index.js";
import "./index.css";
import RPCBlock from './components/rpc';


export const VSCodeButton = createComponent({
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
      <header className='flex justify-center w-full py-4 text-[16px] font-bold align-middle border-b-2'>Contract View</header>
      <RPCBlock></RPCBlock>
    </main>
  );
}

export default App;