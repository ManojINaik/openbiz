# Create mobile-first responsive CSS styles

mobile_first_css = '''
/* Mobile-First Responsive CSS for Udyam Registration Form */

/* Reset and base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8fafc;
  font-size: 16px;
}

.udyam-form-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 16px;
  background-color: #ffffff;
  min-height: 100vh;
}

/* Header styles */
.form-header {
  text-align: center;
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  border-radius: 8px;
}

.form-header h1 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.2;
}

.form-header p {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 400;
}

/* Progress tracker */
.progress-tracker {
  margin-bottom: 32px;
  padding: 16px;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 10%;
  right: 10%;
  height: 2px;
  background-color: #e5e7eb;
  z-index: 1;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 2;
  background-color: #ffffff;
  padding: 8px;
  flex: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.progress-step.active .step-number {
  background-color: #3b82f6;
  color: white;
}

.step-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  max-width: 80px;
  line-height: 1.2;
}

.progress-step.active .step-label {
  color: #1f2937;
  font-weight: 600;
}

/* Form content */
.form-content {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.step-container {
  max-width: 100%;
}

.step-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

/* Form groups */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.required {
  color: #ef4444;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  background-color: #ffffff;
  transition: all 0.3s ease;
  appearance: none;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.form-input::placeholder {
  color: #9ca3af;
  font-size: 14px;
}

/* Select dropdown */
select.form-input {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

/* Radio buttons */
.radio-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

.radio-label:hover {
  background-color: #f3f4f6;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: #3b82f6;
}

/* Buttons */
.btn {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  user-select: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 2px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;
}

/* Messages */
.error-message {
  display: block;
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
}

.help-text {
  display: block;
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
  font-style: italic;
}

.success-message {
  background-color: #f0fdf4;
  border: 2px solid #22c55e;
  border-radius: 8px;
  padding: 16px;
  margin-top: 24px;
}

.success-message p {
  color: #16a34a;
  font-weight: 500;
  margin: 0;
}

/* Toast notifications */
.Toastify__toast-container {
  font-size: 14px;
}

.Toastify__toast {
  border-radius: 8px;
}

/* Loading states */
.btn:disabled {
  position: relative;
}

.btn:disabled::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive breakpoints */

/* Tablet styles (768px and up) */
@media (min-width: 768px) {
  .udyam-form-container {
    max-width: 768px;
    padding: 24px;
    margin: 24px auto;
    border-radius: 16px;
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .form-header {
    padding: 24px;
    border-radius: 12px;
  }

  .form-header h1 {
    font-size: 24px;
  }

  .form-header p {
    font-size: 16px;
  }

  .form-content {
    padding: 32px;
  }

  .step-title {
    font-size: 20px;
  }

  .step-number {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }

  .step-label {
    font-size: 14px;
    max-width: 120px;
  }

  .radio-group {
    gap: 24px;
  }

  .button-group {
    justify-content: flex-end;
  }
}

/* Desktop styles (1024px and up) */
@media (min-width: 1024px) {
  .udyam-form-container {
    max-width: 900px;
    padding: 32px;
  }

  .form-content {
    padding: 40px;
  }

  .form-group {
    margin-bottom: 24px;
  }

  .step-title {
    font-size: 22px;
  }

  .btn {
    padding: 14px 28px;
    min-height: 52px;
  }

  /* Two-column layout for larger screens */
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .progress-steps::before {
    left: 15%;
    right: 15%;
  }
}

/* Large desktop styles (1280px and up) */
@media (min-width: 1280px) {
  .udyam-form-container {
    max-width: 1024px;
  }

  .form-content {
    padding: 48px;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .btn-primary {
    background-color: #1d4ed8;
    border: 2px solid #1e40af;
  }

  .form-input {
    border-width: 3px;
  }

  .form-input:focus {
    border-color: #1d4ed8;
    box-shadow: 0 0 0 4px rgba(29, 78, 216, 0.2);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #111827;
    color: #f9fafb;
  }

  .udyam-form-container {
    background-color: #1f2937;
  }

  .form-content {
    background-color: #1f2937;
    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.5);
  }

  .form-input {
    background-color: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .form-input:focus {
    border-color: #60a5fa;
  }

  .btn-secondary {
    background-color: #374151;
    color: #f9fafb;
    border-color: #4b5563;
  }
}

/* Print styles */
@media print {
  .udyam-form-container {
    box-shadow: none;
    margin: 0;
    padding: 20px;
  }

  .btn, .button-group {
    display: none;
  }

  .progress-tracker {
    display: none;
  }
}
'''

# Save the CSS file
with open('udyam-form.css', 'w') as f:
    f.write(mobile_first_css)

print("✅ Mobile-First Responsive CSS Created Successfully!")
print("📁 File: udyam-form.css")
print("🛠️ Features:")
print("- Mobile-first responsive design")
print("- Tablet and desktop breakpoints")
print("- Accessibility support (reduced motion, high contrast)")
print("- Dark mode support")
print("- Print styles")
print("- Loading animations")
print("- Touch-friendly button sizes (44px minimum)")
print("- Modern CSS Grid and Flexbox layouts")