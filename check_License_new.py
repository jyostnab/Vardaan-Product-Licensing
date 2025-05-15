import requests
import csv
import datetime
import uuid
import logging
import os
import json
import hashlib
from typing import List, Tuple, Dict, Any, Optional

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='license_verification.log'
)
logger = logging.getLogger("LicenseVerifier")

# Add console handler for development
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
logger.addHandler(console_handler)

class LicenseVerifier:
    """Comprehensive license verification system with multiple checks"""
    
    def __init__(self, db_connector=None):
        """Initialize the verifier with optional DB connector"""
        self.country_names = self._load_country_codes()
        self.db = db_connector
        self.cache_dir = os.path.join(os.path.dirname(__file__), "cache")
        
        # Create cache directory if it doesn't exist
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)
    
    def _load_country_codes(self) -> dict:
        """Load country codes from CSV file"""
        country_map = {}
        try:
            csv_path = os.path.join(os.path.dirname(__file__), "country_codes.csv")
            with open(csv_path, 'r') as f:
                reader = csv.reader(f)
                next(reader, None)  # Skip header if it exists
                for row in reader:
                    if len(row) >= 2:
                        name, code = row[0].strip(), row[1].strip()
                        country_map[code] = name
            logger.info(f"Loaded {len(country_map)} country codes")
        except Exception as e:
            logger.error(f"Failed to load country codes: {e}")
        return country_map
    
    def get_current_country(self) -> str:
        """Get country code from public IP using ipinfo.io"""
        try:
            response = requests.get('https://ipinfo.io/json', timeout=5)
            data = response.json()
            country = data.get('country', 'Unknown')
            city = data.get('city', 'Unknown')
            region = data.get('region', 'Unknown')
            ip = data.get('ip', 'Unknown')
            
            country_name = self.country_names.get(country, "Unknown")
            logger.info(f"Detected location: {city}, {region}, {country_name} ({country})")
            logger.info(f"Public IP: {ip}")
            
            return country
        except Exception as e:
            logger.error(f"Failed to get country from IP: {e}")
            return 'Unknown'
    
    def get_system_macs(self) -> List[str]:
        """Get all MAC addresses from all network interfaces"""
        macs = []
        try:
            # Using uuid method for primary MAC
            primary_mac = ':'.join(['{:02X}'.format((uuid.getnode() >> ele) & 0xff)
                            for ele in range(0,8*6,8)][::-1])
            macs.append(primary_mac)
            
            # Try to get more MAC addresses using additional methods
            try:
                import netifaces
                for iface in netifaces.interfaces():
                    addrs = netifaces.ifaddresses(iface)
                    if netifaces.AF_LINK in addrs:
                        for link in addrs[netifaces.AF_LINK]:
                            mac = link.get('addr')
                            if mac and mac != '00:00:00:00:00:00' and mac.upper() not in macs:
                                macs.append(mac.upper())
            except ImportError:
                logger.warning("netifaces not installed, using only primary MAC")
            
            logger.info(f"System MAC addresses: {macs}")
        except Exception as e:
            logger.error(f"Error getting MAC addresses: {e}")
            if not macs:  # Ensure we return at least an empty list
                macs.append("00:00:00:00:00:00")
        
        return macs
    
    def check_country(self, license_key: str, allowed_countries: List[str]) -> Tuple[bool, str]:
        """Check if current country is in allowed countries list"""
        current_country = self.get_current_country()
        country_name = self.country_names.get(current_country, current_country)
        
        if not allowed_countries:
            logger.warning(f"No allowed countries specified for license {license_key}")
            return False, "No allowed countries specified in license"
            
        if current_country in allowed_countries:
            return True, f"Country {country_name} ({current_country}) is allowed"
        else:
            return False, f"License not valid in {country_name} ({current_country})"
    
    def check_mac(self, license_key: str, allowed_macs: List[str]) -> Tuple[bool, str]:
        """Check if any system MAC matches allowed MACs"""
        if not allowed_macs:
            logger.warning(f"No MAC addresses specified for license {license_key}")
            return False, "No MAC addresses specified in license"
            
        system_macs = self.get_system_macs()
        allowed_macs_upper = [m.upper() for m in allowed_macs]
        
        for mac in system_macs:
            if mac in allowed_macs_upper:
                return True, f"MAC address {mac} is authorized"
                
        return False, f"This system's MAC addresses are not authorized"
    
    def check_expiry(self, license_key: str, expiry_date: str) -> Tuple[bool, str]:
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
    
    def check_user_count(self, license_key: str, max_users: int, adding_new_user: bool = False) -> Tuple[bool, str]:
        """Check and update user count for license"""
        try:
            # Use DB if available, otherwise use file storage
            if self.db:
                return self._check_user_count_db(license_key, max_users, adding_new_user)
            else:
                return self._check_user_count_file(license_key, max_users, adding_new_user)
        except Exception as e:
            logger.error(f"Error checking user count for license {license_key}: {e}")
            return False, f"User count check failed: {str(e)}"
    
    def _check_user_count_file(self, license_key: str, max_users: int, adding_new_user: bool) -> Tuple[bool, str]:
        """File-based implementation of user count check"""
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
    
    def _check_user_count_db(self, license_key: str, max_users: int, adding_new_user: bool) -> Tuple[bool, str]:
        """Database implementation of user count check (placeholder)"""
        # In real implementation, this would query the database
        logger.info(f"DB check for license {license_key}, add user: {adding_new_user}")
        # Placeholder implementation
        return self._check_user_count_file(license_key, max_users, adding_new_user)
    
    def get_license_details(self, license_key: str) -> Dict[str, Any]:
        """Get license details from database or file"""
        # For demonstration, this is hardcoded
        # In production, you would query your database
        licenses = {
            "PREMIUM-123": {
                "allowed_countries": ["US", "IN", "MY", "GB", "CA"],
                "allowed_macs": self.get_system_macs(),  # Add current system for demo
                "expiry_date": "2025-12-31",
                "max_users": 50,
                "tier": "Premium",
                "features": ["All Features", "Priority Support", "White Labeling"]
            },
            "STANDARD-456": {
                "allowed_countries": ["US", "IN"],
                "allowed_macs": self.get_system_macs(),
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
                "allowed_macs": self.get_system_macs(),
                "expiry_date": "2023-01-01",  # Expired
                "max_users": 10,
                "tier": "Standard", 
                "features": ["Basic Features", "Email Support"]
            }
        }
        
        # Add current system's license for easy testing
        if license_key not in licenses:
            licenses[license_key] = {
                "allowed_countries": ["US", "IN", "MY"],
                "allowed_macs": self.get_system_macs(),
                "expiry_date": "2025-12-31",
                "max_users": 10,
                "tier": "Custom",
                "features": ["Custom License Features"]
            }
            
        return licenses.get(license_key, {})
    
    def verify_license(self, license_key: str, adding_new_user: bool = False) -> Tuple[bool, str, Dict[str, Any]]:
        """Verify license based on key and return detailed results"""
        license_details = self.get_license_details(license_key)
        
        if not license_details:
            return False, "Invalid license key", {"error": "License key not found"}
        
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
        
        # Generate verification token for API responses
        verification_hash = self._generate_verification_hash(license_key, is_valid)
        results["verification_token"] = verification_hash
        results["verification_time"] = datetime.datetime.now().isoformat()
        
        return is_valid, summary, results
    
    def _generate_verification_hash(self, license_key: str, is_valid: bool) -> str:
        """Generate a hash to validate the verification result"""
        # In a real implementation, this would use proper signing
        hash_input = f"{license_key}:{is_valid}:{datetime.date.today()}"
        return hashlib.md5(hash_input.encode()).hexdigest()

# Demo usage
if __name__ == "__main__":
    verifier = LicenseVerifier()
    
    # Test different license keys
    test_keys = ["PREMIUM-123", "STANDARD-456", "BASIC-789", "EXPIRED-999", "CUSTOM-KEY"]
    
    for key in test_keys:
        print(f"\n===== Testing License Key: {key} =====")
        valid, message, details = verifier.verify_license(key)
        
        print(f"Valid: {valid}")
        print(f"Message: {message}")
        print(f"Details:")
        print(f"  - Tier: {details.get('tier')}")
        print(f"  - Features: {', '.join(details.get('features', []))}")
        print("Verification Results:")
        
        for check_name, check_result in details.get("checks", {}).items():
            status = "✅" if check_result["valid"] else "❌"
            print(f"  {status} {check_name}: {check_result['message']}")
