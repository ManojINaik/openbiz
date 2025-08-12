'use client';
import React from 'react';
import UdyamRegistrationForm from '../UdyamRegistrationForm';
import './globals.css';

export default function Page() {
  return (
    <main className="container-fluid p-0" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <section className="breadcrumbs py-3" style={{ background: '#fff' }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="m-0">UDYAM REGISTRATION FORM - For New Enterprise who are not Registered yet as MSME</h2>
          </div>
        </div>
      </section>
      <section className="inner-page py-4">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="udyam-card">
                <div className="udyam-section-header">Aadhaar Verification With OTP</div>
                <div className="udyam-card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <UdyamRegistrationForm />
                    </div>
                  </div>
                </div>
              </div>
              <a className="udyam-footer-link" href="#">Activities (NIC codes) not covered under MSMED Act, 2006 for Udyam Registration</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


