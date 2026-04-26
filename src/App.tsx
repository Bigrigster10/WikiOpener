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

export default function App() {
  const { init } = useGameStore();

  useEffect(() => {
    init();
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

