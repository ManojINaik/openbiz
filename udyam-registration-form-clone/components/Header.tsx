
import React, { useState } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { MenuIcon } from './icons/MenuIcon';
import { XIcon } from './icons/XIcon';
import Logo from './Logo';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  hasNew?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, hasNew }) => (
  <a href={href} className="flex items-center px-4 py-2 text-sm">
    {children}
    {hasNew && <img alt="New" src="https://udyamregistration.gov.in/images/new.gif" className="h-5 w-9 ml-2" />}
  </a>
);

interface DropdownProps {
  title: string;
  children: React.ReactNode;
  hasNew?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ title, children, hasNew }) => (
  <div className="group relative">
    <button className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium flex items-center" aria-haspopup="true">
      <span>{title}</span>
      {hasNew && <img alt="New" src="https://udyamregistration.gov.in/images/new.gif" className="h-5 w-9 ml-1" />}
      <ChevronDownIcon className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
    </button>
    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block" role="menu">
      <div className="py-1 text-gray-700 hover:[&_a]:bg-gray-100" role="none">
        {children}
      </div>
    </div>
  </div>
);

const MobileDropdown: React.FC<DropdownProps> = ({ title, children, hasNew }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between">
                 <span>{title}</span>
                 {hasNew && <img alt="New" src="https://udyamregistration.gov.in/images/new.gif" className="h-5 w-9 ml-1 inline" />}
                <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="pl-4 text-gray-300 hover:[&_a]:bg-gray-700">{children}</div>}
        </div>
    )
}

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#374187] fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <a href="#" aria-label="Home">
              <Logo />
            </a>
          </div>
          <div className="hidden lg:block">
            <nav className="flex items-center space-x-1">
              <a href="#" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium border-b-2 border-white">Home</a>
              <a href="#" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">NIC Code</a>
              <Dropdown title="Useful Documents">
                <NavLink href="#">Important</NavLink>
                <hr/>
                <NavLink href="#" hasNew>Udyam Registration Benefits</NavLink>
                 <hr/>
                <NavLink href="#">Site Highlights</NavLink>
                 <hr/>
                <NavLink href="#">Circulars & Orders</NavLink>
                 <hr/>
                <NavLink href="#">Udyam Registration Sample form</NavLink>
              </Dropdown>
              <Dropdown title="Print / Verify">
                 <NavLink href="#">Print Udyam Certificate</NavLink>
                 <NavLink href="#" hasNew>Verify Udyam Registration Number</NavLink>
                 <hr/>
                 <NavLink href="#">Print UAM Certificate</NavLink>
                 <NavLink href="#">Print UAM Application</NavLink>
                 <NavLink href="#">Verify Udyog Aadhaar</NavLink>
                 <hr/>
                 <NavLink href="#">Forgot Udyam/UAM No.</NavLink>
              </Dropdown>
               <Dropdown title="Update Details">
                  <NavLink href="#" hasNew>Update/Cancel Udyam Registration</NavLink>
              </Dropdown>
              <Dropdown title="Login">
                <NavLink href="#">Officer's Login</NavLink>
                <NavLink href="#" hasNew>EFC's Login</NavLink>
                <NavLink href="#" hasNew>NSSH Officer's Login</NavLink>
                <NavLink href="#">Udyami Login</NavLink>
              </Dropdown>
            </nav>
          </div>
          <div className="lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:text-gray-300 focus:outline-none">
              {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#374187]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#" className="text-white hover:bg-opacity-75 block px-3 py-2 rounded-md text-base font-medium">Home</a>
              <a href="#" className="text-white hover:bg-opacity-75 block px-3 py-2 rounded-md text-base font-medium">NIC Code</a>
              <MobileDropdown title="Useful Documents">
                <NavLink href="#">Important</NavLink>
                <hr className="border-gray-600"/>
                <NavLink href="#" hasNew>Udyam Registration Benefits</NavLink>
                <hr className="border-gray-600"/>
                <NavLink href="#">Site Highlights</NavLink>
                <hr className="border-gray-600"/>
                <NavLink href="#">Circulars & Orders</NavLink>
                <hr className="border-gray-600"/>
                <NavLink href="#">Udyam Registration Sample form</NavLink>
              </MobileDropdown>
              <MobileDropdown title="Print / Verify">
                 <NavLink href="#">Print Udyam Certificate</NavLink>
                 <NavLink href="#" hasNew>Verify Udyam Registration Number</NavLink>
                 <hr className="border-gray-600"/>
                 <NavLink href="#">Print UAM Certificate</NavLink>
                 <NavLink href="#">Print UAM Application</NavLink>
                 <NavLink href="#">Verify Udyog Aadhaar</NavLink>
                 <hr className="border-gray-600"/>
                 <NavLink href="#">Forgot Udyam/UAM No.</NavLink>
              </MobileDropdown>
               <MobileDropdown title="Update Details">
                  <NavLink href="#" hasNew>Update/Cancel Udyam Registration</NavLink>
              </MobileDropdown>
              <MobileDropdown title="Login">
                <NavLink href="#">Officer's Login</NavLink>
                <NavLink href="#" hasNew>EFC's Login</NavLink>
                <NavLink href="#" hasNew>NSSH Officer's Login</NavLink>
                <NavLink href="#">Udyami Login</NavLink>
              </MobileDropdown>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
