import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PulseShell } from '../src';
import { mockClient } from './mockClient';

// Mirrors what `npx github:AmrMousaa/PulseSharedNavigation` sets up in a real
// app, except the mock client stands in for the generated Dataverse service.
function HostApp() {
  return (
    <>
      <div className="topbar">
        <strong>Host app</strong>
      </div>
      <main>Your app content goes here.</main>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PulseShell
      client={mockClient}
      getUserContext={async () => ({ objectId: 'oid-1', fullName: 'Amr Mousa' })}
      powerAppId="tms"
      homeUrl={null}
      onLaunchApp={(app) => alert(`Launch ${app.name} → ${app.url}`)}
    >
      <HostApp />
    </PulseShell>
  </StrictMode>
);
