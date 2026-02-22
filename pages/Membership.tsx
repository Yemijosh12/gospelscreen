import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PaystackButton } from 'react-paystack';
import { authService } from '../services/authService';

const Membership: React.FC = () => {
  const navigate = useNavigate();
  const publicKey = 'pk_test_2688c949815725156559249feb369cefde3892bf';
  const user = authService.getCurrentUser();
  const email = user?.email || 'gospelscreentv@gmail.com';

  // Toggle state for Monthly/Yearly
  const [planType, setPlanType] = React.useState<'monthly' | 'yearly'>('monthly');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingCancel, setPendingCancel] = useState<'month' | 'year' | null>(null);
  const paystackMonthRef = useRef(null);
  const paystackYearRef = useRef(null);

  const fwConfigMonth = {
    email,
    amount: 150000, // Paystack expects amount in kobo (Naira * 100)
    publicKey,
    text: 'Choose Plan',
    metadata: {
      custom_fields: [
        {
          display_name: 'Membership',
          variable_name: 'membership_type',
          value: '1 Month',
        },
      ],
    },
    onSuccess: () => {
      alert('Payment Successful! Thank you for subscribing.');
      navigate('/member-dashboard');
    },
    onClose: () => handleCancel('month'),
  };

  const handleCancel = (type: 'month' | 'year') => {
    setPendingCancel(type);
    setShowCancelModal(true);
  };

  const fwConfigYear = {
    email,
    amount: 1500000, // 15,000 Naira in kobo
    publicKey,
    text: 'Choose Plan',
    metadata: {
      custom_fields: [
        {
          display_name: 'Membership',
          variable_name: 'membership_type',
          value: '1 Year',
        },
      ],
    },
    onSuccess: () => {
      alert('Payment Successful! Thank you for subscribing.');
      navigate('/member-dashboard');
    },
    onClose: () => handleCancel('year'),
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center relative overflow-hidden text-white">
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#181818] rounded-xl shadow-lg p-8 max-w-xs w-full text-center border border-white/10">
            <div className="mb-6 text-lg text-white font-semibold">Are you sure you want to cancel the payment?</div>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 rounded-lg bg-[#d4af37] text-black font-bold shadow hover:bg-[#c9a32b] transition"
                onClick={() => {
                  setShowCancelModal(false);
                  setPendingCancel(null);
                }}
              >
                Yes
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-gray-700 text-white font-bold shadow hover:bg-gray-600 transition"
                onClick={() => {
                  setShowCancelModal(false);
                  // Reopen Paystack modal for the pending plan
                  setTimeout(() => {
                    if (pendingCancel === 'month' && paystackMonthRef.current) {
                      paystackMonthRef.current.querySelector('button')?.click();
                    } else if (pendingCancel === 'year' && paystackYearRef.current) {
                      paystackYearRef.current.querySelector('button')?.click();
                    }
                    setPendingCancel(null);
                  }, 200);
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Cinematic background image, same as Edit Profile */}
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
      <div className="max-w-5xl w-full mx-auto px-4 z-20">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Activate Your Membership</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-2">Choose a plan and support Christian filmmakers worldwide. <span className="underline">Cancel</span> anytime.</p>
        </div>
        {/* Toggle for Monthly/Yearly */}
        <div className="flex justify-center mb-10">
          <div className="bg-white/10 rounded-full flex p-1 w-fit">
            <button
              className={`px-6 py-2 rounded-full font-semibold shadow transition-all ${planType === 'monthly' ? 'bg-[#d4af37] text-black' : 'text-white'}`}
              onClick={() => setPlanType('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-all ${planType === 'yearly' ? 'bg-[#d4af37] text-black' : 'text-white'}`}
              onClick={() => setPlanType('yearly')}
            >
              Yearly
            </button>
          </div>
        </div>
        {/* Cards arrangement */}
         {planType === 'monthly' && (
           <div className="flex justify-center items-center w-full">
             <div className="bg-[#0f1720] rounded-lg border border-white/10 shadow-sm overflow-hidden flex flex-col justify-between h-full max-w-sm w-full">
               <div className="bg-transparent text-white text-center py-3 font-semibold">1 Month</div>
               <div className="p-6 flex-1 flex flex-col justify-between">
                 <div className="text-center">
                   <div className="text-3xl font-bold text-white">₦1,500 <span className="text-gray-400 text-base font-medium">/ month</span></div>
                 </div>
                 <hr className="my-4 border-white/10" />
                 <ul className="space-y-3 mb-6 text-gray-200">
                   <li className="flex items-center gap-3"><Check className="text-green-500" /> Unlimited Streaming</li>
                   <li className="flex items-center gap-3"><Check className="text-green-500" /> Member-Only Movies</li>
                   <li className="flex items-center gap-3"><Check className="text-green-500" /> Watch on Any Device</li>
                   <li className="flex items-center gap-3"><Check className="text-green-500" /> Watch GFN live</li>
                   <li className="flex items-center gap-3"><Check className="text-green-500" /> Support Christian Filmmakers</li>
                 </ul>
                 <div ref={paystackMonthRef}>
                   <PaystackButton  className="w-full bg-[#d4af37] font-bold text-black py-3 rounded-lg shadow-md" {...fwConfigMonth} />
                 </div>
               </div>
             </div>
           </div>
         )}
         {planType === 'yearly' && (
           <div className="flex justify-center items-center w-full">
             <div className="bg-[#0f1720] rounded-lg border-4 border-[#0f1720] shadow-lg overflow-hidden scale-105 flex flex-col justify-between h-full max-w-sm w-full">
               <div className="bg-transparent text-white text-center py-3 font-semibold">1 Year</div>
               <div className="p-6 flex-1 flex flex-col justify-between">
                 <div className="text-center">
                   <div className="text-3xl font-bold text-white">₦15,000 <span className="text-gray-200 text-base font-medium">/ year</span></div>
                 </div>
                 <hr className="my-4 border-white/10" />
                 <ul className="space-y-3 mb-6 text-white">
                   <li className="flex items-center gap-3"><Check className="text-green-200" /> Unlimited Streaming</li>
                   <li className="flex items-center gap-3"><Check className="text-green-200" /> Member-Only Movies</li>
                   <li className="flex items-center gap-3"><Check className="text-green-200" /> Watch GFN live</li>
                   <li className="flex items-center gap-3"><Check className="text-green-200" /> Watch on Any Device</li>
                   <li className="flex items-center gap-3"><Check className="text-green-200" /> Support Christian Filmmakers</li>
                 </ul>
                 <div ref={paystackYearRef}>
                   <PaystackButton  className="w-full bg-[#d4af37] text-black font-bold py-3 rounded-lg shadow-md" {...fwConfigYear} />
                 </div>
               </div>
             </div>
           </div>
         )}
        <p className="text-center text-xs text-gray-400 mt-6">* Prices shown in Naira (₦) for Nigeria and USD ($) for international users.</p>
      </div>
    </div>
  );
}

export default Membership;
