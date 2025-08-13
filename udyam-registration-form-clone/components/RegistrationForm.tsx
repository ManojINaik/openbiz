
import React, { useState } from 'react';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001';
const AADHAAR_REGEX = /^[2-9][0-9]{11}$/;
const NAME_REGEX = /^[a-zA-Z\s.]{2,}$/;

const RegistrationForm: React.FC = () => {
    const [aadhaar, setAadhaar] = useState('');
    const [name, setName] = useState('');
    const [agreed, setAgreed] = useState(true);
    const [message, setMessage] = useState('');
    const [otpSentTo, setOtpSentTo] = useState<string>('');
    const [otpVisible, setOtpVisible] = useState<boolean>(false);
    const [otp, setOtp] = useState<string>('');
    const [isOtpMock, setIsOtpMock] = useState<boolean>(false);
    const [otpVerified, setOtpVerified] = useState<boolean>(false);
    const [authToken, setAuthToken] = useState<string>('');
    const [panOrgType, setPanOrgType] = useState<string>('');
    const [panNumber, setPanNumber] = useState<string>('');
    const [panName, setPanName] = useState<string>('');
    const [panDob, setPanDob] = useState<string>('');
    const [panAgree, setPanAgree] = useState<boolean>(false);
    const [panMessage, setPanMessage] = useState<string>('');
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
            setOtpSentTo(data?.sent_to || otpSentTo || '');
            setIsOtpMock(Boolean(data?.mock));
            setOtpVisible(true);
            setMessage('');
          } else {
            setMessage(data?.message || data?.error || 'Failed to generate OTP');
          }
        } catch (err: any) {
          setMessage('Network error. Please try again.');
        }
    };

    const handleValidateOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      const otpMockEnabled = String((import.meta as any).env?.VITE_OTPMOCK || '').toLowerCase() === 'true';
      const isMock = (otpMockEnabled || isOtpMock) && otp === '1234';
      const otpPattern = /^[0-9]{6}$/;
      if (!isMock && !otpPattern.test(otp)) {
        setMessage('Please enter valid 6-digit OTP');
        return;
      }
      try {
        setMessage('Validating OTP...');
        const res = await fetch(`${API_BASE}/api/validate-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aadhaar_number: aadhaar, otp })
        });
        const data = await res.json();
        if (res.ok) {
          setMessage('Aadhaar verified successfully');
          if (data?.token) setAuthToken(data.token);
          setOtpVerified(true);
        } else {
          setMessage(data?.message || data?.error || 'Invalid OTP');
        }
      } catch (err) {
        setMessage('Network error. Please try again.');
      }
    };


  if (otpVerified) {
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

        {/* Verified Section */}
        <section className="bg-white p-6 shadow-lg">
          <div className="max-w-full mx-auto">
            <div className="border border-gray-300 rounded-lg">
              <div className="bg-[#0d6efd] p-3 rounded-t-lg"><h3 className="text-lg font-bold text-white">Aadhaar Verification With OTP</h3></div>
              <div className="p-6">
                <p className="text-green-600 font-bold mb-4">OTP verified successfully</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">1. Aadhaar Number / आधार संख्या</label>
                    <input disabled value={aadhaar} className="w-full px-3 py-2 border rounded-md bg-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">2. Name of Entrepreneur / उद्यमी का नाम</label>
                    <input disabled value={name} className="w-full px-3 py-2 border rounded-md bg-gray-100" />
                  </div>
                </div>

                <div className="text-sm text-gray-700 mb-6">
                  <ul className="list-disc list-inside space-y-2">
                    <li>Aadhaar number shall be required for Udyam Registration.</li>
                    <li>The Aadhaar number shall be of the proprietor in the case of a proprietorship firm, of the managing partner in the case of a partnership firm and of a karta in the case of a Hindu Undivided Family (HUF).</li>
                    <li>In case of a Company, LLP, Cooperative Society, Society or Trust, the organisation/authorised signatory shall provide GSTIN and PAN along with its Aadhaar number.</li>
                  </ul>
                </div>

                <div className="text-sm text-gray-600">OTP has been sent to {otpSentTo || '*******5273'}</div>

                {/* PAN Verification Section */}
                <div className="mt-6 border rounded-md">
                  <div className="bg-green-600 text-white px-4 py-2 rounded-t-md">PAN Verification</div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">3. Type of Organisation / संगठन के प्रकार</label>
                        <select value={panOrgType} onChange={(e) => setPanOrgType(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                          <option value="">Type of Organisation / संगठन के प्रकार</option>
                          <option value="proprietorship">Proprietorship</option>
                          <option value="partnership">Partnership</option>
                          <option value="llp">LLP</option>
                          <option value="pvt_company">Private Company</option>
                          <option value="public_company">Public Company</option>
                          <option value="huf">HUF</option>
                          <option value="cooperative">Cooperative</option>
                          <option value="trust">Trust</option>
                          <option value="society">Society</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">4.1 PAN/ पैन</label>
                        <input value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0,10))} maxLength={10} placeholder="ENTER PAN NUMBER" className="w-full px-3 py-2 border rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">4.1.1 Name of PAN Holder / पैन धारक का नाम</label>
                        <input value={panName} onChange={(e) => setPanName(e.target.value)} placeholder="Name as per PAN" className="w-full px-3 py-2 border rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">4.1.2 DOB or DOI as per PAN / पैन के अनुसार जन्म तिथि या निगमण तिथि</label>
                        <input type="text" value={panDob} onChange={(e) => setPanDob(e.target.value)} placeholder="DD/MM/YYYY" className="w-full px-3 py-2 border rounded-md" />
                      </div>
                    </div>

                    <div className="flex items-start text-sm text-justify">
                      <input type="checkbox" className="h-4 w-4 mt-1" checked={panAgree} onChange={(e) => setPanAgree(e.target.checked)} />
                      <label className="ml-3 text-gray-700">I, the holder of the above PAN, hereby give my consent to Ministry of MSME, Government of India, for using my data/information available in the Income Tax Returns filed by me, and also the same available in the GST Returns and also from other Government organizations, for MSME classification and other official purposes, in pursuance of the MSMED Act, 2006.</label>
                    </div>

                    <button type="button" onClick={async () => {
                      setPanMessage('');
                      if (!panOrgType || !panNumber) { setPanMessage('Please fill required PAN fields'); return; }
                      if (!panAgree) { setPanMessage('Please agree to the declaration'); return; }
                      try {
                        setPanMessage('Validating PAN...');
                        const res = await fetch(`${API_BASE}/api/validate-pan`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
                          body: JSON.stringify({ organization_type: panOrgType, pan_number: panNumber.toUpperCase(), gstin: '', filed_itr: 'yes' })
                        });
                        const data = await res.json();
                        if (res.ok) setPanMessage('PAN verified successfully'); else setPanMessage(data?.message || data?.error || 'PAN validation failed');
                      } catch { setPanMessage('Network error. Please try again.'); }
                    }} className="mt-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0d6efd] hover:bg-[#0b5ed7]">PAN Validate</button>

                    {panMessage && (
                      <p className={`mt-3 font-semibold ${panMessage.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-600'}`}>{panMessage}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

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

                    {otpVisible && (
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          <span className="font-bold">Enter One Time Password(OTP) Code</span>
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="OTP code"
                          className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300"
                        />
                        {otpSentTo && (
                          <p className="text-sm text-gray-600 mt-2">OTP has been sent to {otpSentTo}</p>
                        )}

                        <button
                          type="button"
                          onClick={handleValidateOtp}
                          className="mt-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0d6efd] hover:bg-[#0b5ed7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d6efd]"
                        >
                          Validate
                        </button>
                      </div>
                    )}
                    
                    {message && (
                      <p className={`mt-4 font-bold ${message.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                      </p>
                    )}
                </form>
              </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default RegistrationForm;
