
import React, { useState } from 'react';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001';
const AADHAAR_REGEX = /^[2-9][0-9]{11}$/;
const NAME_REGEX = /^[a-zA-Z\s.]{2,}$/;

const RegistrationForm: React.FC = () => {
    const [aadhaar, setAadhaar] = useState('');
    const [name, setName] = useState('');
    const [agreed, setAgreed] = useState(true);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<{ aadhaar?: string; name?: string }>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validateAadhaar = (v: string) => {
      if (!v) return 'Aadhaar is required';
      if (!AADHAAR_REGEX.test(v)) return 'Enter 12 digits starting with 2-9';
      return '';
    };

    const validateName = (v: string) => {
      if (!v) return 'Name is required';
      if (!NAME_REGEX.test(v)) return 'Only letters, spaces and "."; min 2 chars';
      return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const aadhaarErr = validateAadhaar(aadhaar);
        const nameErr = validateName(name);
        setErrors(prev => ({ ...prev, aadhaar: aadhaarErr, name: nameErr }));
        if (aadhaarErr || nameErr) return;
        if (!agreed) {
            setMessage('You must agree to the declaration.');
            return;
        }
        try {
          setMessage('Generating OTP...');
          const res = await fetch(`${API_BASE}/api/generate-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aadhaar_number: aadhaar, entrepreneur_name: name })
          });
          const data = await res.json();
          if (res.ok) {
            setMessage('OTP sent to your registered mobile number.');
          } else {
            setMessage(data?.message || data?.error || 'Failed to generate OTP');
          }
        } catch (err: any) {
          setMessage('Network error. Please try again.');
        }
    };


  return (
    <div className="container mx-auto px-4">
      {/* Breadcrumbs */}
      <section className="bg-gray-200 py-3 px-6">
        <div className="flex justify-between items-center">
          <h2 className="text-base md:text-lg font-semibold text-[#012169]">
            UDYAM REGISTRATION FORM - For New Enterprise who are not Registered yet as MSME
          </h2>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="bg-white p-6 shadow-lg">
        <div className="max-w-full mx-auto">
            <div className="border border-gray-300 rounded-lg">
              <div className="bg-[#0d6efd] p-3 rounded-t-lg">
                <h3 className="text-lg font-bold text-white">Aadhaar Verification With OTP</h3>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-800 mb-1">
                                <span className="font-bold">1. Aadhaar Number</span>/ आधार संख्या
                            </label>
                            <input
                                type="text"
                                id="aadhaar"
                                inputMode="numeric"
                                value={aadhaar}
                                onChange={(e) => {
                                  const v = e.target.value.replace(/\D/g, '').slice(0, 12);
                                  setAadhaar(v);
                                  if (touched.aadhaar) setErrors(prev => ({ ...prev, aadhaar: validateAadhaar(v) }));
                                }}
                                onBlur={() => { setTouched(t => ({ ...t, aadhaar: true })); setErrors(prev => ({ ...prev, aadhaar: validateAadhaar(aadhaar) })); }}
                                maxLength={12}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.aadhaar ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Your Aadhaar No"
                                autoComplete="off"
                            />
                            {errors.aadhaar && (<p className="mt-1 text-sm text-red-600">{errors.aadhaar}</p>)}
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-1">
                                <span className="font-bold">2. Name of Entrepreneur</span> / उद्यमी का नाम
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setName(v);
                                  if (touched.name) setErrors(prev => ({ ...prev, name: validateName(v) }));
                                }}
                                onBlur={() => { setTouched(t => ({ ...t, name: true })); setErrors(prev => ({ ...prev, name: validateName(name) })); }}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Name as per Aadhaar"
                                autoComplete="off"
                            />
                            {errors.name && (<p className="mt-1 text-sm text-red-600">{errors.name}</p>)}
                        </div>
                    </div>
                    
                    <div className="mb-4 text-sm text-gray-700">
                        <ul className="list-disc list-inside space-y-2">
                             <li>Aadhaar number shall be required for Udyam Registration.</li>
                             <li>The Aadhaar number shall be of the proprietor in the case of a proprietorship firm, of the managing partner in the case of a partnership firm and of a karta in the case of a Hindu Undivided Family (HUF).</li>
                             <li>In case of a Company or a Limited Liability Partnership or a Cooperative Society or a Society or a Trust, the organisation or its authorised signatory shall provide its GSTIN (As per applicablity of CGST Act 2017 and as notified by the ministry of MSME <a href="#" className="text-[#0d6efd] hover:underline">vide S.O. 1055(E) dated 05th March 2021</a>) and PAN along with its Aadhaar number.</li>
                        </ul>
                    </div>
                    
                    <div className="flex items-start mb-6 text-sm text-justify">
                        <input
                            id="declaration"
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="h-5 w-5 text-[#374187] focus:ring-[#4f5fba] border-gray-300 rounded mt-1"
                        />
                        <label htmlFor="declaration" className="ml-3 text-gray-700">
                            I, the holder of the above Aadhaar, hereby give my consent to Ministry of MSME, Government of India, for using my Aadhaar number as alloted by UIDAI for Udyam Registration. NIC / Ministry of MSME, Government of India, have informed me that my aadhaar data will not be stored/shared. / मैं, आधार धारक, इस प्रकार उद्यम पंजीकरण के लिए यूआईडीएआई के साथ अपने आधार संख्या का उपयोग करने के लिए सू0ल0म0उ0 मंत्रालय, भारत सरकार को अपनी सहमति देता हूं। एनआईसी / सू0ल0म0उ0 मंत्रालय, भारत सरकार ने मुझे सूचित किया है कि मेरा आधार डेटा संग्रहीत / साझा नहीं किया जाएगा।
                        </label>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0d6efd] hover:bg-[#0b5ed7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d6efd]"
                        >
                            Validate &amp; Generate OTP
                        </button>
                    </div>
                    
                    {message && <p className="mt-4 text-green-600 font-bold">{message}</p>}
                </form>
              </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default RegistrationForm;
