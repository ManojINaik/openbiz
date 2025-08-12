# Let's create the project structure and start with the web scraping component
import json

# Based on the research, I'll create the scraped form schema
udyam_form_schema = {
    "steps": {
        "step1": {
            "name": "Aadhaar Verification with OTP",
            "fields": [
                {
                    "name": "aadhaar_number",
                    "label": "Aadhaar Number / आधार संख्या",
                    "type": "text",
                    "required": True,
                    "maxLength": 12,
                    "placeholder": "Enter 12-digit Aadhaar number",
                    "validation": {
                        "pattern": "^[2-9][0-9]{11}$",
                        "errorMessage": "Please enter valid 12-digit Aadhaar number"
                    }
                },
                {
                    "name": "entrepreneur_name",
                    "label": "Name of Entrepreneur / उद्यमी का नाम",
                    "type": "text",
                    "required": True,
                    "placeholder": "Enter name as per Aadhaar",
                    "validation": {
                        "pattern": "^[a-zA-Z\\s.]+$",
                        "minLength": 2,
                        "errorMessage": "Name must match Aadhaar card"
                    }
                },
                {
                    "name": "otp",
                    "label": "Enter OTP",
                    "type": "text",
                    "required": True,
                    "maxLength": 6,
                    "placeholder": "Enter 6-digit OTP",
                    "validation": {
                        "pattern": "^[0-9]{6}$",
                        "errorMessage": "Please enter valid 6-digit OTP"
                    }
                }
            ]
        },
        "step2": {
            "name": "PAN Verification",
            "fields": [
                {
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
                },
                {
                    "name": "pan_number",
                    "label": "PAN Number",
                    "type": "text",
                    "required": True,
                    "maxLength": 10,
                    "placeholder": "Enter 10-digit PAN",
                    "validation": {
                        "pattern": "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
                        "errorMessage": "PAN format: AAAAA9999A (5 letters, 4 numbers, 1 letter)"
                    }
                },
                {
                    "name": "gstin",
                    "label": "GSTIN (if applicable)",
                    "type": "text",
                    "required": False,
                    "maxLength": 15,
                    "placeholder": "Enter GSTIN",
                    "validation": {
                        "pattern": "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
                        "errorMessage": "Please enter valid GSTIN"
                    }
                },
                {
                    "name": "filed_itr",
                    "label": "Have you filed last year's ITR?",
                    "type": "radio",
                    "required": True,
                    "options": [
                        {"value": "yes", "label": "Yes"},
                        {"value": "no", "label": "No"}
                    ]
                }
            ]
        }
    },
    "ui_components": {
        "buttons": [
            {
                "name": "validate_generate_otp",
                "label": "Validate & Generate OTP",
                "type": "primary"
            },
            {
                "name": "validate_otp",
                "label": "Validate OTP",
                "type": "primary"
            },
            {
                "name": "validate_pan",
                "label": "Validate PAN",
                "type": "primary"
            },
            {
                "name": "continue",
                "label": "Continue",
                "type": "primary"
            }
        ],
        "progress_tracker": {
            "steps": ["Aadhaar Verification", "PAN Verification", "Registration Details"],
            "current_step": 1
        }
    },
    "validation_rules": {
        "aadhaar": {
            "pattern": "^[2-9][0-9]{11}$",
            "description": "12-digit number starting with 2-9"
        },
        "pan": {
            "pattern": "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
            "description": "Format: AAAAA9999A",
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
            "description": "6-digit numeric OTP"
        }
    }
}

# Save the schema to a file
with open('udyam_form_schema.json', 'w') as f:
    json.dump(udyam_form_schema, f, indent=2)

print("✅ Udyam Form Schema Created Successfully!")
print("📋 Schema includes:")
print("- Step 1: Aadhaar Verification with OTP")
print("- Step 2: PAN Verification") 
print("- Complete validation rules")
print("- UI component specifications")
print("- Field types and constraints")