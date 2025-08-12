
import React from 'react';
import { TwitterIcon } from './icons/TwitterIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { InstagramIcon } from './icons/InstagramIcon';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#374187] text-gray-300">
      <div className="bg-[#2c346c]">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="footer-contact">
              <h3 className="text-xl font-bold text-white mb-4">Udyam Registration</h3>
              <p>
                Ministry of MSME <br />
                Udyog bhawan - New Delhi<br /><br />
                <strong>Email:</strong> champions@gov.in<br /><br />
                <strong><a href="#" className="text-white hover:underline">Contact Us</a></strong><br />
                <strong><a href="#" className="text-white hover:underline">For Grievances / Problems</a></strong>
              </p>
            </div>

            <div className="footer-links">
              <h4 className="text-xl font-bold text-white mb-4">Our Services</h4>
              <ul className="space-y-2">
                <li><i className="bx bx-chevron-right"></i> <a href="#" className="hover:text-white">CHAMPIONS</a></li>
                <li><i className="bx bx-chevron-right"></i> <a href="#" className="hover:text-white">MSME Samadhaan</a></li>
                <li><i className="bx bx-chevron-right"></i> <a href="#" className="hover:text-white">MSME Sambandh</a></li>
                <li><i className="bx bx-chevron-right"></i> <a href="#" className="hover:text-white">MSME Dashboard</a></li>
                <li><i className="bx bx-chevron-right"></i> <a href="#" className="hover:text-white">Entrepreneurship Skill Development Programme (ESDP)</a></li>
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
              Website hosted &amp; managed by <a href="#" className="text-white hover:underline">National Informatics Centre</a>, <a href="#" className="text-white hover:underline">Ministry of Communications and IT</a>, <a href="#" className="text-white hover:underline">Government of India</a>
            </div>
          </div>
          <div className="social-links text-center md:text-right pt-3 md:pt-0 flex justify-center md:justify-end space-x-3">
            <a href="#" className="twitter w-6 h-6 flex items-center justify-center text-white hover:text-gray-400" aria-label="Follow us on Twitter"><TwitterIcon /></a>
            <a href="#" className="facebook w-6 h-6 flex items-center justify-center text-white hover:text-gray-400" aria-label="Follow us on Facebook"><FacebookIcon /></a>
            <a href="#" className="instagram w-6 h-6 flex items-center justify-center text-white hover:text-gray-400" aria-label="Follow us on Instagram"><InstagramIcon /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
