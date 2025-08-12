
import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import RegistrationForm from './components/RegistrationForm';
import { AccessibilityIcon } from './components/icons/AccessibilityIcon';

const App: React.FC = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />
       <main className="flex-grow pt-24 pb-16">
        <RegistrationForm />
      </main>
      <Footer />
       <div className="fixed bottom-5 right-5 flex flex-col items-center space-y-1 z-50 cursor-pointer group">
        <button className="bg-[#7b46d9] text-white p-3 rounded-full shadow-lg hover:bg-[#6941c6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b46d9]">
          <AccessibilityIcon className="w-7 h-7" />
        </button>
        <span className="text-sm text-blue-600 font-semibold text-center group-hover:underline">Activities (NIC codes)</span>
      </div>
    </div>
  );
};

export default App;
