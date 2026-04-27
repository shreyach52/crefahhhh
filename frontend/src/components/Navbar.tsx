"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, User, LogOut, LayoutDashboard, Search, Users } from 'lucide-react';

export default function Navbar() {
  const { user, logOut, signInWithGoogle } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">CREFAH</span>
          </a>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="/analyze" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5">
              <Search className="w-4 h-4" /> Analyze
            </a>
            <a href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </a>
            <a href="/community" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Community
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600 uppercase">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
                <span className="text-xs font-bold text-slate-600">{user.displayName?.split(' ')[0]}</span>
              </div>
              <button 
                onClick={logOut}
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
