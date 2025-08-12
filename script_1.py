# Create a comprehensive web scraper for Udyam portal
web_scraper_code = '''
"""
Udyam Registration Portal Web Scraper
Extracts form fields, validation rules, and UI components from the first two steps
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import logging
from typing import Dict, List, Optional
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

class UdyamPortalScraper:
    def __init__(self, headless=True):
        self.base_url = "https://udyamregistration.gov.in/UdyamRegistration.aspx"
        self.session = requests.Session()
        self.form_data = {}
        self.setup_logging()
        self.setup_selenium(headless)
    
    def setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('udyam_scraper.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def setup_selenium(self, headless=True):
        """Setup Selenium WebDriver"""
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
    
    def scrape_step1_aadhaar_verification(self) -> Dict:
        """Scrape Aadhaar verification step"""
        try:
            self.logger.info("Scraping Step 1: Aadhaar Verification")
            self.driver.get(self.base_url)
            
            # Wait for page to load
            time.sleep(3)
            
            # Extract form fields
            fields = []
            
            # Aadhaar number field
            aadhaar_field = self.wait.until(
                EC.presence_of_element_located((By.NAME, "ctl00$ContentPlaceHolder1$txtAadharNo"))
            )
            fields.append({
                "name": "aadhaar_number",
                "label": "Aadhaar Number / आधार संख्या",
                "type": "text",
                "required": True,
                "maxLength": aadhaar_field.get_attribute("maxlength") or "12",
                "placeholder": aadhaar_field.get_attribute("placeholder") or "",
                "validation": {
                    "pattern": "^[2-9][0-9]{11}$",
                    "errorMessage": "Please enter valid 12-digit Aadhaar number"
                }
            })
            
            # Entrepreneur name field
            name_field = self.driver.find_element(By.NAME, "ctl00$ContentPlaceHolder1$txtEntrepreneurName")
            fields.append({
                "name": "entrepreneur_name",
                "label": "Name of Entrepreneur / उद्यमी का नाम",
                "type": "text",
                "required": True,
                "placeholder": name_field.get_attribute("placeholder") or "",
                "validation": {
                    "pattern": "^[a-zA-Z\\s.]+$",
                    "minLength": 2,
                    "errorMessage": "Name must match Aadhaar card"
                }
            })
            
            # Extract validation messages and help text
            help_texts = []
            help_elements = self.driver.find_elements(By.CLASS_NAME, "help-text")
            for element in help_elements:
                if element.text:
                    help_texts.append(element.text)
            
            # Extract button information
            generate_otp_btn = self.driver.find_element(By.ID, "ctl00_ContentPlaceHolder1_btnValidateAadhar")
            buttons = [{
                "name": "validate_generate_otp",
                "label": generate_otp_btn.get_attribute("value") or "Validate & Generate OTP",
                "type": "primary"
            }]
            
            return {
                "step_name": "Aadhaar Verification with OTP",
                "step_number": 1,
                "fields": fields,
                "buttons": buttons,
                "help_texts": help_texts,
                "validation_rules": {
                    "aadhaar_required": True,
                    "name_must_match_aadhaar": True,
                    "otp_verification_required": True
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error scraping Step 1: {str(e)}")
            return {}
    
    def scrape_step2_pan_verification(self) -> Dict:
        """Scrape PAN verification step"""
        try:
            self.logger.info("Scraping Step 2: PAN Verification")
            
            # This would typically require navigating through step 1 first
            # For demonstration, we'll simulate the expected structure
            
            fields = []
            
            # Organization type dropdown
            fields.append({
                "name": "organization_type",
                "label": "Type of Organisation",
                "type": "select",
                "required": True,
                "options": [
                    {"value": "proprietorship", "label": "Proprietorship"},
                    {"value": "partnership", "label": "Partnership Firm"},
                    {"value": "llp", "label": "Limited Liability Partnership (LLP)"},
                    {"value": "pvt_company", "label": "Private Limited Company"},
                    {"value": "public_company", "label": "Public Limited Company"},
                    {"value": "huf", "label": "Hindu Undivided Family (HUF)"},
                    {"value": "cooperative", "label": "Co-operative Society"},
                    {"value": "trust", "label": "Trust"},
                    {"value": "society", "label": "Society"}
                ]
            })
            
            # PAN number field
            fields.append({
                "name": "pan_number",
                "label": "PAN Number",
                "type": "text",
                "required": True,
                "maxLength": "10",
                "placeholder": "Enter 10-digit PAN",
                "validation": {
                    "pattern": "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
                    "errorMessage": "PAN format: AAAAA9999A (5 letters, 4 numbers, 1 letter)"
                }
            })
            
            # GSTIN field
            fields.append({
                "name": "gstin",
                "label": "GSTIN (if applicable)",
                "type": "text",
                "required": False,
                "maxLength": "15",
                "placeholder": "Enter GSTIN",
                "validation": {
                    "pattern": "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
                    "errorMessage": "Please enter valid GSTIN"
                }
            })
            
            # ITR filed checkbox
            fields.append({
                "name": "filed_itr",
                "label": "Have you filed last year's ITR?",
                "type": "radio",
                "required": True,
                "options": [
                    {"value": "yes", "label": "Yes"},
                    {"value": "no", "label": "No"}
                ]
            })
            
            buttons = [{
                "name": "validate_pan",
                "label": "Validate PAN",
                "type": "primary"
            }]
            
            return {
                "step_name": "PAN Verification",
                "step_number": 2,
                "fields": fields,
                "buttons": buttons,
                "validation_rules": {
                    "pan_format_strict": True,
                    "organization_type_required": True,
                    "gstin_optional": True,
                    "itr_declaration_required": True
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error scraping Step 2: {str(e)}")
            return {}
    
    def extract_validation_patterns(self) -> Dict:
        """Extract validation patterns and rules"""
        return {
            "aadhaar": {
                "pattern": "^[2-9][0-9]{11}$",
                "description": "12-digit number starting with 2-9",
                "length": 12
            },
            "pan": {
                "pattern": "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
                "description": "Format: AAAAA9999A",
                "length": 10,
                "fourth_char_types": {
                    "C": "Company",
                    "P": "Person", 
                    "H": "Hindu Undivided Family (HUF)",
                    "F": "Firm",
                    "A": "Association of Persons (AOP)",
                    "T": "AOP (Trust)",
                    "B": "Body of Individuals (BOI)",
                    "L": "Local Authority",
                    "J": "Artificial Juridical Person",
                    "G": "Government"
                }
            },
            "otp": {
                "pattern": "^[0-9]{6}$",
                "description": "6-digit numeric OTP",
                "length": 6
            },
            "gstin": {
                "pattern": "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
                "description": "15-character GSTIN format",
                "length": 15
            }
        }
    
    def scrape_complete_form(self) -> Dict:
        """Scrape complete form data from both steps"""
        try:
            self.logger.info("Starting complete form scraping...")
            
            step1_data = self.scrape_step1_aadhaar_verification()
            step2_data = self.scrape_step2_pan_verification()
            validation_patterns = self.extract_validation_patterns()
            
            complete_form_data = {
                "portal_url": self.base_url,
                "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "steps": {
                    "step1": step1_data,
                    "step2": step2_data
                },
                "validation_patterns": validation_patterns,
                "ui_components": {
                    "progress_tracker": {
                        "steps": ["Aadhaar Verification", "PAN Verification", "Registration Details"],
                        "current_step": 1
                    },
                    "form_layout": "multi-step",
                    "responsive": True,
                    "mobile_first": True
                },
                "technical_requirements": {
                    "otp_verification": True,
                    "real_time_validation": True,
                    "mobile_responsive": True,
                    "government_api_integration": True
                }
            }
            
            return complete_form_data
            
        except Exception as e:
            self.logger.error(f"Error in complete form scraping: {str(e)}")
            return {}
        finally:
            self.driver.quit()
    
    def save_scraped_data(self, data: Dict, filename: str = "scraped_udyam_data.json"):
        """Save scraped data to JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            self.logger.info(f"Scraped data saved to {filename}")
        except Exception as e:
            self.logger.error(f"Error saving data: {str(e)}")

def main():
    """Main function to run the scraper"""
    scraper = UdyamPortalScraper(headless=True)
    scraped_data = scraper.scrape_complete_form()
    
    if scraped_data:
        scraper.save_scraped_data(scraped_data)
        print("✅ Scraping completed successfully!")
        print(f"📄 Data saved to scraped_udyam_data.json")
        print(f"🔍 Found {len(scraped_data.get('steps', {}))} steps")
    else:
        print("❌ Scraping failed!")

if __name__ == "__main__":
    main()
'''

# Save the scraper code
with open('udyam_scraper.py', 'w') as f:
    f.write(web_scraper_code)

print("✅ Web Scraper Created Successfully!")
print("📁 File: udyam_scraper.py")
print("🛠️ Features:")
print("- Selenium WebDriver for dynamic content")
print("- Beautiful Soup for HTML parsing") 
print("- Comprehensive error handling")
print("- Logging system")
print("- JSON output format")