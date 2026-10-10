import { useState, FormEvent } from 'react';
import { ArrowLeft, User, Mail, School, Phone, Save, LogOut, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNav } from '@/context/NavContext';
import { supabase } from '@/lib/supabase';

export function ProfilePage() {
  const { profile, signOut, refreshProfile } = useAuth();
  const { navigate } = useNav();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    school: profile?.school || '',
    phone: profile?.phone || '',
  });

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: formData.username,
        full_name: formData.full_name,
        school: formData.school,
        phone: formData.phone || null,
      })
      .eq('id', profile!.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await refreshProfile();
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const fieldClass = 'w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm';

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please sign in to view your profile.</p>
          <button
            onClick={() => navigate('login')}
            className="px-5 py-2.5 rounded-xl bg-teal-500 text-white font-semibold text-sm hover:bg-teal-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('home')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 px-6 py-8 flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
              <p className="text-teal-100 text-sm">@{profile.username}</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {saved && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-600 text-sm mb-4">
                <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm mb-4">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={editing ? formData.username : profile.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!editing}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={editing ? formData.full_name : profile.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={!editing}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className={`${fieldClass} bg-gray-50`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">School</label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={editing ? formData.school : profile.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    disabled={!editing}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={editing ? formData.phone : (profile.phone || '')}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editing}
                    className={fieldClass}
                    placeholder="Not provided"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {editing ? (
                  <>
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-500 text-white font-semibold text-sm hover:bg-teal-600 transition-colors"
                    >
                      <Save className="w-4 h-4" /> Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          username: profile.username,
                          full_name: profile.full_name,
                          email: profile.email,
                          school: profile.school,
                          phone: profile.phone || '',
                        });
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="flex-1 py-2.5 rounded-xl bg-teal-500 text-white font-semibold text-sm hover:bg-teal-600 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>

            <div className="border-t border-gray-100 mt-6 pt-6">
              <button
                onClick={() => {
                  signOut();
                  navigate('home');
                }}
                className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
