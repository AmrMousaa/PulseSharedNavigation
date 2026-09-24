import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PulseMenuButton, PulseNavigation } from '../src';
import '../src/styles.css';
import { mockClient } from './mockClient';

function Playground() {
  const [open, setOpen] = useState(true);
  const [docked, setDocked] = useState(false);
  return (
    <>
      <PulseNavigation
        client={mockClient}
        getUserContext={async () => ({ objectId: 'oid-1', fullName: 'Amr Mousa' })}
        isOpen={open}
        onClose={() => setOpen(false)}
        variant={docked ? 'docked' : 'overlay'}
        currentAppId="a-7"
        homeUrl={null}
        onLaunchApp={(app) => alert(`Launch ${app.name} → ${app.url}`)}
      />
      <div className={docked ? 'psn-docked-offset' : undefined}>
        <div className="topbar">
          <PulseMenuButton onClick={() => setOpen(true)} />
          <strong>Host app</strong>
          <label style={{ marginLeft: 'auto' }}>
            <input type="checkbox" checked={docked} onChange={(e) => setDocked(e.target.checked)} /> Docked
          </label>
        </div>
        <main>Your app content goes here.</main>
      </div>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Playground />
  </StrictMode>
);
