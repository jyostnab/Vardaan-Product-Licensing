#!/usr/bin/env python3
import sys
import json
import os
import traceback
import datetime
import uuid
import requests
import logging
import hashlib

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='license_verification.log'
)
logger = logging.getLogger("LicenseVerifier")

# Add console handler for script output visibility
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
logger.addHandler(console_handler)

class LicenseVerifier:
    """Simple license verification for script use"""
    
    def __init__(self):
        """Initialize the verifier"""
        self.cache_dir = os.path.join(os.path.dirname(__file__), "cache")
        
        # Create cache directory if it doesn't exist
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)
    
    def get_current_country(self):
        """Get country code from public IP using ipinfo.io"""
        try:
            response = requests.get('https://ipinfo.io/json', timeout=5)
            data = response.json()
            country = data.get('country', 'Unknown')
            logger.info(f"Detected country: {country}")
            return country
        except Exception as e:
            logger.error(f"Failed to get country from IP: {e}")
            return 'Unknown'
    
    def get_system_mac(self):
        """Get system MAC address"""
        mac = ':'.join(['{:02X}'.format((uuid.getnode() >> ele) & 0xff)
                     for ele in range(0,8*6,8)][::-1])
        logger.info(f"System MAC: {mac}")
        return mac
    
    def check_country(self, license_key, allowed_countries):
        """Check if current country is in allowed countries list"""
        current_country = self.get_current_country()
        
        if not allowed_countries:
            return False, "No allowed countries specified in license"
            
        if current_country in allowed_countries:
            return True, f"Country {current_country} is allowed"
        else:
            return False, f"License not valid in {current_country}"
    
    def check_mac(self, license_key, allowed_macs):
        """Check if system MAC matches allowed MACs"""
        if not allowed_macs:
            return False, "No MAC addresses specified in license"
            
        system_mac = self.get_system_mac()
        allowed_macs_upper = [m.upper() for m in allowed_macs]
        
        if system_mac in allowed_macs_upper:
            return True, f"MAC address {system_mac} is authorized"
        return False, f"This system's MAC address is not authorized"
    
    def check_expiry(self, license_key, expiry_date):
        """Check if license has expired or is about to expire"""
        try:
            today = datetime.date.today()
            expiry = datetime.datetime.strptime(expiry_date, "%Y-%m-%d").date()
            days_left = (expiry - today).days
            
            if days_left < 0:
                return False, f"License expired {abs(days_left)} days ago"
            elif days_left <= 30:
                return True, f"License expires soon (in {days_left} days). Please renew."
            else:
                return True, f"License valid for {days_left} more days"
        except Exception as e:
            logger.error(f"Error checking expiry for license {license_key}: {e}")
            return False, f"Invalid expiry date format"
    
    def check_user_count(self, license_key, max_users, adding_new_user=False):
        """Check and update user count for license"""
        user_count_file = os.path.join(self.cache_dir, f"user_count_{license_key}.txt")
        
        try:
            with open(user_count_file, 'r') as f:
                current_users = int(f.read().strip())
        except FileNotFoundError:
            current_users = 0
        
        if adding_new_user:
            if current_users >= max_users:
                return False, f"User limit reached: {current_users}/{max_users}"
            else:
                current_users += 1
                with open(user_count_file, 'w') as f:
                    f.write(str(current_users))
                return True, f"New user added: {current_users}/{max_users}"
        else:
            if current_users >= max_users:
                return False, f"User limit reached: {current_users}/{max_users}"
            else:
                return True, f"User count OK: {current_users}/{max_users}"
    
    def get_license_details(self, license_key):
        """Get license details - in real implementation, this would query a database"""
        # For demonstration, this uses hardcoded values
        licenses = {
            "PREMIUM-123": {
                "allowed_countries": ["US", "IN", "MY", "GB", "CA"],
                "allowed_macs": [self.get_system_mac()],  # Add current system for demo
                "expiry_date": "2025-12-31",
                "max_users": 50,
                "tier": "Premium",
                "features": ["All Features", "Priority Support", "White Labeling"]
            },
            "STANDARD-456": {
                "allowed_countries": ["US", "IN"],
                "allowed_macs": [self.get_system_mac()],
                "expiry_date": "2025-06-30",
                "max_users": 25,
                "tier": "Standard",
                "features": ["Basic Features", "Email Support", "API Access"]
            },
            "BASIC-789": {
                "allowed_countries": ["US"],
                "allowed_macs": ["00:11:22:33:44:55"],  # Not matching current system
                "expiry_date": "2024-12-31",
                "max_users": 5,
                "tier": "Basic",
                "features": ["Basic Features", "Community Support"]
            },
            "EXPIRED-999": {
                "allowed_countries": ["US", "IN", "MY"],
                "allowed_macs": [self.get_system_mac()],
                "expiry_date": "2023-01-01",  # Expired
                "max_users": 10,
                "tier": "Standard", 
                "features": ["Basic Features", "Email Support"]
            }
        }
        
        # Add current system's license for easy testing of unknown keys
        if license_key not in licenses:
            licenses[license_key] = {
                "allowed_countries": ["US", "IN", "MY"],
                "allowed_macs": [self.get_system_mac()],
                "expiry_date": "2025-12-31",
                "max_users": 10,
                "tier": "Custom",
                "features": ["Custom License Features"]
            }
            
        return licenses.get(license_key, {})
    
    def verify_license(self, license_key, adding_new_user=False):
        """Verify license and return result"""
        license_details = self.get_license_details(license_key)
        
        results = {
            "license_key": license_key,
            "tier": license_details.get("tier", "Unknown"),
            "checks": {},
            "features": license_details.get("features", [])
        }
        
        is_valid = True
        messages = []
        
        # Country check
        country_valid, country_msg = self.check_country(
            license_key, 
            license_details.get("allowed_countries", [])
        )
        results["checks"]["country"] = {"valid": country_valid, "message": country_msg}
        if not country_valid:
            is_valid = False
            messages.append(country_msg)
        
        # MAC check
        mac_valid, mac_msg = self.check_mac(
            license_key,
            license_details.get("allowed_macs", [])
        )
        results["checks"]["mac"] = {"valid": mac_valid, "message": mac_msg}
        if not mac_valid:
            is_valid = False
            messages.append(mac_msg)
        
        # Expiry check
        expiry_valid, expiry_msg = self.check_expiry(
            license_key,
            license_details.get("expiry_date", "2000-01-01")
        )
        results["checks"]["expiry"] = {"valid": expiry_valid, "message": expiry_msg}
        if not expiry_valid:
            is_valid = False
            messages.append(expiry_msg)
        elif "expires soon" in expiry_msg:
            # Add warning even though license is valid
            messages.append(expiry_msg)
        
        # User count check
        user_valid, user_msg = self.check_user_count(
            license_key,
            license_details.get("max_users", 1),
            adding_new_user
        )
        results["checks"]["user_count"] = {"valid": user_valid, "message": user_msg}
        if not user_valid:
            is_valid = False
            messages.append(user_msg)
        
        # Create summary message
        if is_valid:
            summary = "License verification successful"
            if messages:  # Add warnings
                summary += " with notices: " + "; ".join(messages)
        else:
            summary = "License verification failed: " + "; ".join(messages)
        
        # Add verification token
        hash_input = f"{license_key}:{is_valid}:{datetime.date.today()}"
        results["verification_token"] = hashlib.md5(hash_input.encode()).hexdigest()
        results["verification_time"] = datetime.datetime.now().isoformat()
        
        return is_valid, summary, results

def main():
    """Command line interface for license verification"""
    try:
        # Check arguments
        if len(sys.argv) < 2:
            print(json.dumps({
                "valid": False,
                "message": "License key required",
                "details": {"error": "Missing license key argument"}
            }))
            return 1
        
        license_key = sys.argv[1]
        mode = sys.argv[2] if len(sys.argv) > 2 else "verify"
        adding_user = mode.lower() == "add-user"
        
        # Initialize verifier and verify license
        verifier = LicenseVerifier()
        valid, message, details = verifier.verify_license(license_key, adding_user)
        
        # Return JSON result
        print(json.dumps({
            "valid": valid,
            "message": message,
            "details": details
        }))
        return 0
        
    except Exception as e:
        # Return error as JSON
        error_result = {
            "valid": False,
            "message": f"Verification error: {str(e)}",
            "details": {
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        }
        print(json.dumps(error_result))
        return 1

if __name__ == "__main__":
    sys.exit(main())
