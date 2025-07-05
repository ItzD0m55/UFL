// pages/index.tsx
'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const platforms = ['UFL PC', 'UFL PS5', 'UFL XBOX'] as const;
type Platform = typeof platforms[number];

type Fighter = {
  name: string;
  platform: Platform;
  wins: number;
  losses: number;
  draws: number;
  koWins: number;
  previousRank: number;
};

type Fight = {
  fighter1: string;
  fighter2: string;
  winner: string;
  method: 'KO' | 'Decision';
  platform: Platform;
  date: string;
};

export default function Home() {
  const [tab, setTab] = useState<'Records' | Platform | 'Fights' | 'Admin'>('Records');
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [fights, setFights] = useState<Fight[]>([]);
  const [champions, setChampions] = useState<Record<Platform, string>>({
    'UFL PC': '',
    'UFL PS5': '',
    'UFL XBOX': '',
  });
  const [admin, setAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const savedFighters = localStorage.getItem('fighters');
    const savedFights = localStorage.getItem('fights');
    const savedChampions = localStorage.getItem('champions');
    if (savedFighters) setFighters(JSON.parse(savedFighters));
    if (savedFights) setFights(JSON.parse(savedFights));
    if (savedChampions) setChampions(JSON.parse(savedChampions));
  }, []);

  useEffect(() => {
    localStorage.setItem('fighters', JSON.stringify(fighters));
    localStorage.setItem('fights', JSON.stringify(fights));
    localStorage.setItem('champions', JSON.stringify(champions));
  }, [fighters, fights, champions]);

  const addFighter = (name: string, platform: Platform) => {
    if (fighters.find(f => f.name === name)) return alert('Name already exists');
    const newFighter: Fighter = {
      name,
      platform,
      wins: 0,
      losses: 0,
      draws: 0,
      koWins: 0,
      previousRank: 0,
    };
    setFighters([...fighters, newFighter]);
  };

  const addFight = (fight: Fight) => {
    const updatedFighters = fighters.map(f => {
      if (f.name === fight.fighter1 || f.name === fight.fighter2) {
        const isWinner = f.name === fight.winner;
        const isDraw = fight.winner === 'Draw';
        return {
          ...f,
          wins: f.wins + (isWinner ? 1 : 0),
          losses: f.losses + (!isWinner && !isDraw ? 1 : 0),
          draws: f.draws + (isDraw ? 1 : 0),
          koWins: f.koWins + (isWinner && fight.method === 'KO' ? 1 : 0),
        };
      }
      return f;
    });
    setFighters(updatedFighters);
    setFights([...fights, fight]);
  };

  const deleteFight = (index: number) => {
    const updatedFights = [...fights];
    updatedFights.splice(index, 1);
    setFights(updatedFights);
  };

  const setChampion = (platform: Platform, name: string) => {
    setChampions({ ...champions, [platform]: name });
  };

  const rankedFighters = (platform: Platform) => {
    const platformFighters = fighters.filter(f => f.platform === platform);
    return platformFighters
      .map(f => {
        const quality = fights
          .filter(fight => fight.platform === platform && (fight.fighter1 === f.name || fight.fighter2 === f.name))
          .reduce((acc, fight) => {
            const opponentName = fight.fighter1 === f.name ? fight.fighter2 : fight.fighter1;
            const opponent = fighters.find(o => o.name === opponentName);
            return acc + (opponent ? opponent.wins : 0);
          }, 0);
        return { ...f, quality };
      })
      .sort((a, b) => {
        const scoreA = a.wins * 5 + a.quality - a.losses * 2;
        const scoreB = b.wins * 5 + b.quality - b.losses * 2;
        return scoreB - scoreA;
      })
      .slice(0, 10);
  };

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black min-h-screen text-white p-6">
      <motion.div 
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-blue-900/20 to-cyan-900/20 animate-pulse blur-xl z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 2 }}
      />
      <div className="relative z-10">
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
      >
      UFL WORLD RANKINGS
      </motion.h1>
      <nav className="flex flex-wrap justify-center gap-3 text-lg mb-6">
        {['Records', ...platforms, 'Fights', 'Admin'].map(t => (
          <motion.button key={t} onClick={() => setTab(t as any)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors">
            {t}
          </motion.button>
        ))}
      </nav>

      {tab === 'Records' && (
        <div>
          <input
            className="mb-4 p-2 bg-gray-800 border border-gray-600"
            placeholder="Search Fighters..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fighters.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map(f => (
              <div key={f.name} className="bg-gray-800 p-4 rounded-xl shadow-xl">
                <h2 className="text-xl font-bold text-cyan-400">{f.name}</h2>
                <p>Wins: {f.wins}</p>
                <p>Losses: {f.losses}</p>
                <p>Draws: {f.draws}</p>
                <p>KO %: {f.wins > 0 ? ((f.koWins / f.wins) * 100).toFixed(1) : 0}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {platforms.includes(tab as Platform) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-full text-2xl font-bold mb-2">
            Champion: 🏆 {champions[tab as Platform] || 'None'}
          </div>
          {rankedFighters(tab as Platform).map((f, i) => (
            <motion.div
              key={f.name}
              className="bg-gray-800 p-4 rounded-xl shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold">#{i + 1} {f.name}</h2>
              <p>Wins: {f.wins}</p>
              <p>Losses: {f.losses}</p>
              <p>Draws: {f.draws}</p>
              <p>KO %: {f.wins > 0 ? ((f.koWins / f.wins) * 100).toFixed(1) : 0}%</p>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'Fights' && (
        <div>
          <input
            className="mb-4 p-2 bg-gray-800 border border-gray-600"
            placeholder="Search Fights..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="space-y-4">
            {fights.filter(f => f.fighter1.toLowerCase().includes(search.toLowerCase()) || f.fighter2.toLowerCase().includes(search.toLowerCase())).map((fight, i) => (
              <div key={i} className="bg-gray-800 p-4 rounded-xl shadow">
                <p>{fight.fighter1} vs {fight.fighter2}</p>
                <p>Winner: {fight.winner}</p>
                <p>Method: {fight.method}</p>
                <p>Platform: {fight.platform}</p>
                <p>Date: {fight.date}</p>
                {admin && <button onClick={() => deleteFight(i)} className="text-red-500">Delete</button>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Admin' && (
        <div>
          {!admin ? (
            <div>
              <input
                className="p-2 bg-gray-800 border border-gray-600"
                placeholder="Enter Admin Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                onClick={() => setAdmin(password === '690FAHG3671279FGKASGF')}
                className="ml-2 px-4 py-2 bg-green-600 rounded"
              >Login</button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">Add Fighter</h2>
                <input placeholder="Name" id="name" className="p-2 bg-gray-800 border" />
                <select id="platform" className="ml-2 p-2 bg-gray-800 border">
                  {platforms.map(p => <option key={p}>{p}</option>)}
                </select>
                <button
                  className="ml-2 px-4 py-2 bg-blue-600 rounded"
                  onClick={() => {
                    const nameInput = document.getElementById('name') as HTMLInputElement;
                    const platformSelect = document.getElementById('platform') as HTMLSelectElement;
                    addFighter(nameInput.value, platformSelect.value as Platform);
                  }}
                >Add</button>
              </div>
              <div>
                <h2 className="text-xl font-bold">Add Fight</h2>
                <select id="f1" className="p-2 bg-gray-800 border">
                  {fighters.map(f => <option key={f.name}>{f.name}</option>)}
                </select>
                <select id="f2" className="ml-2 p-2 bg-gray-800 border">
                  {fighters.map(f => <option key={f.name}>{f.name}</option>)}
                </select>
                <select id="winner" className="ml-2 p-2 bg-gray-800 border">
                  <option>Draw</option>
                  {fighters.map(f => <option key={f.name}>{f.name}</option>)}
                </select>
                <select id="method" className="ml-2 p-2 bg-gray-800 border">
                  <option>KO</option>
                  <option>Decision</option>
                </select>
                <select id="fightPlatform" className="ml-2 p-2 bg-gray-800 border">
                  {platforms.map(p => <option key={p}>{p}</option>)}
                </select>
                <input id="date" type="date" className="ml-2 p-2 bg-gray-800 border" />
                <button
                  className="ml-2 px-4 py-2 bg-green-600 rounded"
                  onClick={() => {
                    const f1 = (document.getElementById('f1') as HTMLSelectElement).value;
                    const f2 = (document.getElementById('f2') as HTMLSelectElement).value;
                    const winner = (document.getElementById('winner') as HTMLSelectElement).value;
                    const method = (document.getElementById('method') as HTMLSelectElement).value;
                    const platform = (document.getElementById('fightPlatform') as HTMLSelectElement).value as Platform;
                    const date = (document.getElementById('date') as HTMLInputElement).value;
                    if (f1 && f2 && method && platform && date) {
                      addFight({ fighter1: f1, fighter2: f2, winner, method: method as 'KO' | 'Decision', platform, date });
                    }
                  }}
                >Add Fight</button>
              </div>
              <div>
                <h2 className="text-xl font-bold">Set Champion</h2>
                {platforms.map(p => (
                  <div key={p} className="mb-2">
                    <span>{p}: </span>
                    <select
                      onChange={e => setChampion(p, e.target.value)}
                      value={champions[p] || ''}
                      className="p-2 bg-gray-800 border"
                    >
                      <option value="">None</option>
                      {fighters.filter(f => f.platform === p).map(f => (
                        <option key={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
          </div>
    </motion.main>
  );
}