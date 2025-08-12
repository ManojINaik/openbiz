
import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import RegistrationForm from './components/RegistrationForm';
import { AccessibilityIcon } from './components/icons/AccessibilityIcon';

const App: React.FC = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />
       <main className="flex-grow pt-24 pb-16">
        <RegistrationForm />
      </main>
      {/* Moving link in the space below form and above footer */}
      <div className="w-full py-2">
        <marquee behavior="scroll" direction="left" scrollamount="5">
          <a
            style={{ cursor: 'pointer' }}
            href="docs/OM_regarding_inclusion_of_Traders02072021.pdf"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 font-semibold"
          >
            Activities (NIC codes) not covered under MSMED Act, 2006 for Udyam Registration
          </a>
        </marquee>
      </div>
      <Footer />
       <div className="fixed bottom-5 right-5 flex flex-col items-center space-y-1 z-50 cursor-pointer group">
        <button className="bg-[#7b46d9] text-white p-3 rounded-full shadow-lg hover:bg-[#6941c6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7b46d9]">
          <AccessibilityIcon className="w-7 h-7" />
        </button>
        <span className="text-sm text-blue-600 font-semibold text-center group-hover:underline">Activities (NIC codes)</span>
      </div>

      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white max-w-lg w-full mx-4 rounded-lg shadow-xl border border-gray-200">
            <div className="px-6 py-4 border-b bg-red-50 rounded-t-lg">
              <h3 className="text-lg font-semibold text-red-700">Important Disclaimer</h3>
            </div>
            <div className="px-6 py-5 space-y-3 text-gray-700">
              <p>
                This is <span className="font-semibold">NOT</span> an official Government website. It is a
                <span className="font-semibold"> dummy demo</span> built to mimic the Udyam Registration UI for an
                internship assignment.
              </p>
              <p className="font-semibold text-red-700">
                Do not enter any real personal information (Aadhaar, PAN, phone, etc.). Any data you enter here is
                for testing only.
              </p>
              <p>
                For the official Udyam Registration, please visit the Government portal.
              </p>
            </div>
            <div className="px-6 py-4 flex items-center justify-end gap-3 border-t rounded-b-lg bg-gray-50">
              <a
                href="https://udyamregistration.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
              >
                Go to official site
              </a>
              <button
                onClick={() => setShowDisclaimer(false)}
                className="px-4 py-2 text-sm rounded-md bg-[#0d6efd] hover:bg-[#0b5ed7] text-white shadow"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
