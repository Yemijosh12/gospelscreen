import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { subscriptionService } from '../services/subscriptionService';
import Navbar from '../components/Navbar';
import { Check, Calendar, Clock } from 'lucide-react';

const MemberDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const userName = user?.name || 'Member';
  const [plan, setPlan] = useState<string>('');
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>('');
  const [renewalDate, setRenewalDate] = useState<string>('');

  useEffect(() => {
    const fetchSub = async () => {
      if (!user?.email) return;
      try {
        const sub = await subscriptionService.fetchSubscription(user.email);
        if (sub && sub.subscription_start) {
          setPlan(sub.subscription_plan || '');
          setStartDate(sub.subscription_start);
          // Calculate days left and renewal date based on plan
          const start = new Date(sub.subscription_start);
          const now = new Date();
          let duration = 30;
          let renewal = new Date(start);
          if (sub.subscription_plan && sub.subscription_plan.toLowerCase().includes('year')) {
            duration = 365;
            renewal.setFullYear(renewal.getFullYear() + 1);
          } else {
            renewal.setMonth(renewal.getMonth() + 1);
          }
          setRenewalDate(renewal.toISOString());
          const diff = Math.max(0, duration - Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
          setDaysLeft(diff);
        }
      } catch (err) {
        console.error('Failed to fetch subscription:', err);
      }
    };
    fetchSub();
  }, [user?.email]);
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center relative overflow-hidden text-white">
      {/* Cinematic background image, same as Auth/Sign In page */}
      <div 
        className="fixed top-0 left-0 w-screen h-screen bg-cover bg-center bg-no-repeat transition-transform duration-1000 z-0"
        style={{ backgroundImage: `url('image21.png')`, backgroundPosition: '40% 50%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
      </div>

      {/* Background decorations */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] pointer-events-none z-10" />
      <div className="max-w-6xl w-full z-20">
        <h1 className="text-2xl font-bold text-white mb-2">Membership Dashboard</h1>
        <p className="text-gray-300 mb-6">Welcome, {userName}! Here's your membership information:</p>

        <div className="bg-[#121212] rounded-2xl shadow-md overflow-hidden border border-white/10">
          <div className="md:flex">
            <div className="md:w-2/3 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#d4af37] text-black rounded-full p-3">
                    <Check size={20} />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">Membership Status</div>
                    <div className="text-sm text-green-400 flex items-center gap-2"><Check size={14} /> Active</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-2"><Calendar size={16} /> {renewalDate ? new Date(renewalDate).toLocaleDateString() : '-'}</div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="col-span-2 bg-[#0f1720] p-4 rounded-lg border border-white/10">
                  <div className="text-sm text-gray-400">Subscription Plan</div>
                  <div className="text-lg font-semibold text-white">{plan || '-'}</div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-[#121212] p-3 rounded-md text-sm border border-white/10">
                      <div className="text-xs text-gray-400">Plan</div>
                      <div className="font-medium text-white">{plan ? `${plan} Membership` : '-'}</div>
                    </div>
                    <div className="bg-[#121212] p-3 rounded-md text-sm border border-white/10">
                      <div className="text-xs text-gray-400">Renewal</div>
                      <div className="font-medium text-white">{plan || '-'}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f1720] p-4 rounded-lg border border-white/10 flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-400">Days Left</div>
                  <div className="mt-2">
                    <div className="w-20 h-20 rounded-full border-4 border-[#d4af37] flex items-center justify-center text-2xl font-bold text-[#d4af37]">{daysLeft}</div>
                    <div className="text-sm text-gray-400 mt-2">{daysLeft === 1 ? 'Day' : 'Days'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/3 bg-[#121212] p-6 border-l border-white/10 flex flex-col justify-center">
              
              <div className="mt-6">
                <button className="w-full bg-[#d4af37] text-black py-3 rounded-lg font-semibold shadow-md" onClick={() => navigate('/profile')}>Cancel subscription</button>
              </div>

              <div className="mt-4 text-xs text-gray-400">* Note: Cancel anytime to stop auto-renewal. You will keep full access until your membership expires.</div>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default MemberDashboard;
