/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Play } from './pages/Play';
import { Inventory } from './pages/Inventory';
import { Minigames } from './pages/Minigames';
import { Leaderboard } from './pages/Leaderboard';
import { Settings } from './pages/Settings';
import { Legal } from './pages/Legal';
import { About } from './pages/About';
import { Battles } from './pages/Battles';
import { useGameStore } from './store/gameStore';
import { doc, getDocFromCache, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'stats', 'global'));
    console.log("Firestore connection verified.");
  } catch (error: any) {
    if (error.message?.includes('the client is offline') || error.code === 'unavailable') {
      console.error("Please check your network connection or Firebase configuration.");
    } else {
      console.error("Firestore connectivity test failed:", error);
    }
  }
}

export default function App() {
  const { init } = useGameStore();

  useEffect(() => {
    init();
    testConnection();
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Play />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="minigames" element={<Minigames />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="legal" element={<Legal />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

