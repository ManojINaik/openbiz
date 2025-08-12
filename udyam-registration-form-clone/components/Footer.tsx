
import React from 'react';
import { TwitterIcon } from './icons/TwitterIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { InstagramIcon } from './icons/InstagramIcon';

const Footer: React.FC = () => {
  const confirmExternal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const ok = window.confirm("You will be transferred to an external web site not controlled by MoMSME. MoMSME is not responsible for any of the info or services provided by this web site. \nAre you sure you want to proceed?");
    if (!ok) e.preventDefault();
  };

  return (
    <footer id="footer" className="bg-[#374187] text-gray-300">
      <div className="bg-[#2c346c]">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="footer-contact">
              <h3 className="text-xl font-bold text-white mb-4">Udyam Registration</h3>
              <p>
                Ministry of MSME <br />
                Udyog bhawan - New Delhi<br /><br />
                <strong>Email:</strong> champions@gov.in<br /><br />
                <strong><a style={{color:'#fff'}} href="/ContactUs.aspx" aria-label="Contact Us">Contact Us</a></strong><br />
                <strong><a style={{color:'#fff'}} href="https://champions.gov.in/" target="_blank" aria-label="For Grievances / Problems" rel="noreferrer">For Grievances / Problems</a></strong>
              </p>
            </div>

            <div className="footer-links">
              <h4 className="text-xl font-bold text-white mb-4">Our Services</h4>
              <ul className="space-y-2">
                <li><i className="bx bx-chevron-right"></i> <a href="https://champions.gov.in/" aria-label="Champions" className="hover:text-white">CHAMPIONS</a></li>
                <li><i className="bx bx-chevron-right"></i> <a href="https://samadhaan.msme.gov.in/" aria-label="MSME Samadhaan" className="hover:text-white">MSME Samadhaan</a></li>
                <li><i className="bx bx-chevron-right"></i> <a href="https://sambandh.msme.gov.in/" aria-label="MSME Sambandh" className="hover:text-white">MSME Sambandh</a></li>
                <li><i className="bx bx-chevron-right"></i> <a href="https://dashboard.msme.gov.in/" aria-label="MSME Dashboard" className="hover:text-white">MSME Dashboard</a></li>
                <li><i className="bx bx-chevron-right"></i> <a href="https://msmedi.dcmsme.gov.in/" aria-label="ESDP" className="hover:text-white">Entrepreneurship Skill Development Programme (ESDP)</a></li>
              </ul>
            </div>

            <div className="footer-newsletter">
              <h4 className="text-xl font-bold text-white mb-4">Video</h4>
              <video controls poster="https://udyamregistration.gov.in/videos/udyam.png" className="w-full rounded-lg">
                <source src="https://udyamregistration.gov.in/videos/udyam.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

          </div>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="copyright-wrap md:flex py-4 px-4">
          <div className="mr-md-auto text-center md:text-left text-sm">
            <div className="copyright">
              &copy; Copyright <strong><span>Udyam Registration</span></strong>. All Rights Reserved, Website Content Managed by Ministry of Micro Small and Medium Enterprises, GoI
            </div>
            <div className="credits mt-1">
              Website hosted &amp; managed by  
              <a style={{color:'#fff'}} href="http://home.nic.in/" target="_blank" aria-label="National Informatics Centre" rel="noreferrer">National Informatics Centre</a>, 
              <a style={{color:'#fff'}} href="http://deity.gov.in/" target="_blank" aria-label="Ministry of Communication and IT" rel="noreferrer">Ministry of Communications and IT</a>, 
              <a style={{color:'#fff'}} href="http://india.gov.in/" target="_blank" rel="noreferrer">Government of India</a>
            </div>
          </div>
          <div className="social-links text-center md:text-right pt-3 md:pt-0 flex justify-center md:justify-end space-x-3">
            <a href="https://twitter.com/minmsme?original_referer=http%3A%2F%2Fmsme.gov.in%2FWeb%2FPortal%2FSocialMedia.aspx&profile_id=2595957175&tw_i=539287566780874752&tw_p=embeddedtimeline&tw_w=483558219873144833" className="twitter w-6 h-6 flex items-center justify-center text-white hover:text-gray-400" aria-label="Follow us on Twitter" onClick={confirmExternal}><TwitterIcon /></a>
            <a href="https://www.facebook.com/minmsme" className="facebook w-6 h-6 flex items-center justify-center text-white hover:text-gray-400" aria-label="Follow us on Facebook" onClick={confirmExternal}><FacebookIcon /></a>
            <a href="https://www.instagram.com/minmsme/" className="instagram w-6 h-6 flex items-center justify-center text-white hover:text-gray-400" aria-label="Follow us on Instagram" onClick={confirmExternal}><InstagramIcon /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
