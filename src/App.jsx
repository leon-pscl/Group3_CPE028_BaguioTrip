import React, { useEffect, useMemo, useState } from 'react';
import { ATTRACTIONS, CATEGORY_META } from './data.js';
import { loadTrip, saveTrip, defaultTrip, crpId, saveTripToServer, loadTripFromServer } from './storage.js';
import { getToken, getUser, clearAuth } from './auth.js';
import Login from './Login.jsx';
import Schedule from './Schedule.jsx';
import Weather from './Weather.jsx';
import TripMap from './TripMap.jsx';
import Travel from './Travel.jsx';

const TABS = [
  { id: 'plan', label: 'Plan', ico: '\u25C8' },
  { id: 'weather', label: 'Weather', ico: '\u2600' },
  { id: 'map', label: 'Map', ico: '\u25B2' },
  { id: 'travel', label: 'Travel', ico: '\u2197' }
];

export default function App() {
  const [tab, setTab] = useState('plan');
  const [authData, setAuthData] = useState(() => {
    const token = getToken();
    const user = getUser();
    return token ? { token, user } : null;
  });
  const [trip, setTrip] = useState(() => loadTrip() || defaultTrip());

  function handleLogin() {
    setAuthData({ token: getToken(), user: getUser() });
  }

  function handleLogout() {
    saveTrip(trip);
    clearAuth();
    setAuthData(null);
  }

  // Load trip from server when auth state becomes logged-in.
  useEffect(() => {
    if (!authData) return;
    loadTripFromServer().then((serverTrip) => {
      if (serverTrip) setTrip(serverTrip);
    });
  }, [authData]);

  // Persist — server if logged in, localStorage otherwise.
  useEffect(() => {
    if (!authData) {
      saveTrip(trip);
      return;
    }
    const timer = setTimeout(() => {
      saveTripToServer(trip);
    }, 400);
    return () => clearTimeout(timer);
  }, [trip, authData]);

  const attractionById = useMemo(() => {
    const m = {};
    for (const a of ATTRACTIONS) m[a.id] = a;
    return m;
  }, []);

  // Every attraction referenced by the plan, for the map markers.
  const plannedStops = useMemo(() => {
    const seen = new Set();
    const out = [];
    trip.days.forEach((day, di) => {
      day.stops.forEach((s) => {
        const a = attractionById[s.attractionId];
        if (a && !seen.has(a.id)) { seen.add(a.id); out.push({ ...a, dayIndex: di }); }
      });
    });
    return out;
  }, [trip, attractionById]);

  if (!authData) {
    return (
      <div className="app">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-top">
          <div className="kicker">City of Pines</div>
          <button className="logout-btn" onClick={handleLogout}>Log out</button>
        </div>
        <h1>Baguio Trip</h1>
        <p>Build your days, watch the highland weather, map every stop.</p>
      </header>

      {tab === 'plan' && (
        <Schedule trip={trip} setTrip={setTrip} attractionById={attractionById} />
      )}
      {tab === 'weather' && <Weather trip={trip} />}
      {tab === 'map' && <TripMap stops={plannedStops} />}
      {tab === 'travel' && <Travel trip={trip} attractionById={attractionById} />}

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
            aria-label={t.label}
          >
            <span className="ico">{t.ico}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export { CATEGORY_META, crpId };