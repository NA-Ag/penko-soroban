import React from 'react';
import { LeaderboardEntry } from '../types';
import { TRANSLATIONS } from '../translations';
import { cardStyle } from '../styles';

interface LeaderboardModalProps {
  entries: LeaderboardEntry[];
  onClose: () => void;
  t: typeof TRANSLATIONS['en'];
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ entries, onClose, t }) => (
    <div className="fixed inset-0 bg-slate-950/95 z-[100] flex items-center justify-center p-4">
        <div className={`max-w-2xl w-full ${cardStyle} max-h-[80vh] flex flex-col`}>
            <div className="flex justify-between items-center mb-6 border-b-2 border-white pb-4">
                <h2 className="text-2xl font-bold text-purple-400 font-mono uppercase tracking-widest">{t.leaderboard}</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-left font-mono">
                    <thead className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                        <tr>
                            <th className="pb-2">{t.rank}</th>
                            <th className="pb-2">{t.enter_name}</th>
                            <th className="pb-2">{t.score}</th>
                            <th className="pb-2 text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {entries.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score).map((entry: LeaderboardEntry, i: number) => (
                            <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                <td className="py-3 text-slate-500">#{i + 1}</td>
                                <td className="py-3 font-bold text-white">{entry.name}</td>
                                <td className="py-3 text-purple-400">{entry.score.toLocaleString()}</td>
                                <td className="py-3 text-right text-slate-400 text-xs">{entry.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {entries.length === 0 && <div className="text-center py-8 text-slate-600">No scores yet.</div>}
            </div>
        </div>
    </div>
);

export default LeaderboardModal;