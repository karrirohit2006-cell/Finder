import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Key, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { api } from '../services/api';

export const StudentServicesPage: React.FC = () => {
  const [servicesInfo, setServicesInfo] = useState<any>({
    room: 'Room 302, Block 32 (Division of Student Welfare)',
    email: 'studentservices@lpu.co.in',
    phone: '+91 1824 517000 / Ext. 3201',
    hours: 'Monday - Saturday: 9:00 AM - 5:00 PM',
    disclaimer: 'Back2You is an independent community portal for the LPU campus. If you need in-person recovery or official verification, please visit the Student Services Division.'
  });

  useEffect(() => {
    api.getStudentServices().then(setServicesInfo).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Title */}
      <div className="border-b border-slate-200 pb-6 max-w-3xl space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5" />
          <span>Campus Support & Governance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          LPU Student Services Division
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Official contact details, password assistance procedures, in-person handoff lockers, and platform safety disclosures.
        </p>
      </div>

      {/* Primary Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-medium block">Office Location</span>
          <span className="font-bold text-slate-900 text-sm block leading-snug">
            {servicesInfo.room}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-medium block">Phone Helpline</span>
          <span className="font-bold text-slate-900 text-sm block">
            {servicesInfo.phone}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-medium block">Email Support</span>
          <span className="font-bold text-slate-900 text-sm block truncate">
            {servicesInfo.email}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-medium block">Visiting Hours</span>
          <span className="font-bold text-slate-900 text-sm block leading-snug">
            {servicesInfo.hours}
          </span>
        </div>

      </div>

      {/* Procedural Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Password Recovery Assistance */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Password Recovery Assistance</h2>
              <span className="text-xs text-slate-500">In-person university verification</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To prevent account hijacking and unauthorized recovery claims, Back2You does not offer automated email or SMS OTP password reset.
          </p>

          <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-900 block">How to Reset Your Credentials:</span>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
              <li>Visit Student Services Division in Block 32 (Room 302).</li>
              <li>Present your valid LPU Physical Student/Staff Identity Card.</li>
              <li>A verification representative will issue an authorized password reset authorization code.</li>
            </ol>
          </div>
        </div>

        {/* Physical Custody & Secure Handoffs */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Physical Campus Custody Desk</h2>
              <span className="text-xs text-slate-500">Neutral campus handoff point</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            If you found a high-value item (such as a laptop, gold jewelry, or wallet with cash) and prefer not to arrange an individual direct meetup:
          </p>

          <div className="space-y-2 text-xs text-slate-700 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
            <span className="font-bold text-emerald-950 block">Drop-off Procedure:</span>
            <ul className="list-disc list-inside space-y-1.5 text-emerald-900">
              <li>Deposit the item at the Block 32 Student Services Lost & Found locker.</li>
              <li>You will receive an official physical receipt acknowledging custody.</li>
              <li>Reference the receipt number in your Back2You found item report.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Safety & Moderation Disclosure (Section 18) */}
      <div className="bg-slate-100 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
        <div className="flex items-center space-x-2.5 text-slate-900">
          <ShieldAlert className="w-6 h-6 text-amber-600" />
          <h2 className="text-base font-bold">Platform Safety & Moderation Disclosure</h2>
        </div>

        <div className="text-xs sm:text-sm text-slate-600 space-y-2 leading-relaxed">
          <p>
            <span className="font-semibold text-slate-900">No Administrator Account:</span> Back2You operates as an independent peer-to-peer lost & found recovery application without an administrator login or automated approval queue.
          </p>
          <p>
            <span className="font-semibold text-slate-900">User Reports & Blocking:</span> If you encounter suspicious communication, harassment, or false claims, use the in-app "Report User" or "Block User" options. Reports are filed in the database for campus record. Note that reports are not automatically reviewed by an administrator. For urgent emergencies or threats, reach out directly to LPU Campus Security (+91 1824 517100).
          </p>
        </div>
      </div>

    </div>
  );
};
