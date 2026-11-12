import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin, Clock, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 border-t border-navy-800 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">Back<span className="text-blue-400">2</span>You</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Lost something? Found something? Let's bring it Back2You." A dedicated peer-to-peer lost & found recovery network for the Lovely Professional University campus community.
            </p>
            <div className="pt-1">
              <span className="text-[11px] inline-block px-2.5 py-1 rounded bg-navy-900 border border-navy-800 text-slate-400">
                🔒 Privacy Protected • Argon2id Encrypted
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Discovery</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/lost-items" className="hover:text-blue-400 transition">Browse Lost Items</Link>
              </li>
              <li>
                <Link to="/found-items" className="hover:text-blue-400 transition">Browse Found Items</Link>
              </li>
              <li>
                <Link to="/search/image" className="hover:text-blue-400 transition">Image-Based Similarity Search</Link>
              </li>
              <li>
                <Link to="/report/lost" className="hover:text-blue-400 transition">Report Lost Belonging</Link>
              </li>
              <li>
                <Link to="/report/found" className="hover:text-blue-400 transition">Report Found Belonging</Link>
              </li>
            </ul>
          </div>

          {/* Community & Safety */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Account & Safety</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard" className="hover:text-blue-400 transition">User Dashboard</Link>
              </li>
              <li>
                <Link to="/recovery" className="hover:text-blue-400 transition">Recovery Requests</Link>
              </li>
              <li>
                <Link to="/messages" className="hover:text-blue-400 transition">Private In-App Messaging</Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-blue-400 transition">Report History</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-blue-400 transition">Safety & Moderation Disclosures</Link>
              </li>
            </ul>
          </div>

          {/* LPU Student Services Division */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Student Services Info</h3>
            <p className="text-xs text-slate-400">
              For official in-person verification or password assistance, visit:
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Room 302, Block 32 (Division of Student Welfare), LPU</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+91 1824 517000 / Ext. 3201</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>studentservices@lpu.co.in</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Mon - Sat: 9:00 AM - 5:00 PM</span>
              </div>
            </div>
          </div>

        </div>

        {/* Legal Disclaimer & Independent Notice */}
        <div className="mt-8 pt-6 border-t border-navy-900/80 text-[11px] text-slate-500 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <p>
            © {new Date().getFullYear()} Back2You. Independent campus community platform. Not officially owned or endorsed by Lovely Professional University administration.
          </p>
          <p className="flex items-center space-x-1">
            <span>Built with care for LPU students and staff</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
