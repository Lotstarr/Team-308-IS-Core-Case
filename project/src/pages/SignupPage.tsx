import { useState, FormEvent } from 'react';
import { GraduationCap, ArrowLeft, User, Lock, Mail, School, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNav } from '@/context/NavContext';

export function SignupPage() {
  const { signUp } = useAuth();
  const { navigate } = useNav();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    school: '',
    phone: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const required = ['username', 'password', 'fullName', 'email', 'school'];
  const isFormValid = required.every((f) => formData[f as keyof typeof formData].trim() !== '');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError(null);
    setLoading(true);

    const { error: signUpError } = await signUp(formData.email, formData.password, {
      username: formData.username,
      full_name: formData.fullName,
      email: formData.email,
      school: formData.school,
      phone: formData.phone || undefined,
    });

    if (signUpError) {
      setError(signUpError);
      setLoading(false);
    } else {
      navigate('home');
    }
  };

  const fieldClass = 'w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm';

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('home')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 px-6 py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="text-teal-100 text-sm mt-1">Join StudentPerks to start saving</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Username *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={fieldClass}
                  placeholder="johndoe123"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={fieldClass}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={fieldClass}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={fieldClass}
                  placeholder="john@university.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">School *</label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className={fieldClass}
                  placeholder="University of Pittsburgh"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={fieldClass}
                  placeholder="412-555-1234"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('login')}
                className="text-teal-600 font-semibold hover:text-teal-700"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
