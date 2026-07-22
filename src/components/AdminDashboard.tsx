import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { Shield, Users, RefreshCw } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<{id: string, profile: UserProfile}[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const data = snap.docs.map(doc => ({ id: doc.id, profile: doc.data() as UserProfile }));
      setUsers(data);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display italic flex items-center gap-2 text-romantic-pink">
          <Shield className="w-5 h-5" /> Admin View
        </h2>
        <button onClick={fetchUsers} className="p-2 bg-white/5 rounded-full"><RefreshCw className="w-4 h-4" /></button>
      </div>
      {loading ? <p className="text-white/40">Loading...</p> : (
        <div className="space-y-4">
          {users.map(u => (
            <div key={u.id} className="glass p-4 rounded-xl">
              <p className="text-xs text-white/40">ID: {u.id}</p>
              <p className="font-bold">{u.profile.partner1Name} & {u.profile.partner2Name}</p>
              <p className="text-xs mt-1">Start Date: {new Date(u.profile.startDate).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
