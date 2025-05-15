import requests
import csv
import datetime
import uuid
import getpass

def check_country(allowed_countries=None):
    """
    Checks if the current system's country is in the allowed countries list.
    Extracts country automatically from public IP address using geolocation API.
    
    Args:
        allowed_countries: List of allowed country codes
        
    Returns:
        tuple: (is_valid: bool, message: str)
    """
    # Read country codes CSV
    reader = csv.reader(open('country_codes.csv', 'r'))
    cnames = {}
    for row in reader:
        k, v = row[0], row[1]  # country name, country code
        cnames[v] = k  # Use code as key, name as value
    
    flag = True
    msg = "Licence is Valid"
    
    # Default allowed countries if none provided
    if allowed_countries is None:
        allowed_countries = ("MY", "US", "IN")
        
    try:
        # Get public IP address and country from ipinfo.io API
        response = requests.get('https://ipinfo.io/json', timeout=5)
        data = response.json()
        
        # Extract country code from response
        country = data.get('country', 'Unknown')
        
        # Get additional location info for reporting
        city = data.get('city', 'Unknown')
        region = data.get('region', 'Unknown')
        ip = data.get('ip', 'Unknown')
        
        print(f"Detected location: {city}, {region}, {cnames.get(country, country)} (Code: {country})")
        print(f"Public IP: {ip}")
        
        if country not in allowed_countries:
            msg = f"This software does not work in {cnames.get(country, country)} (Code: {country})"
            flag = False
        return flag, msg
        
    except requests.RequestException as e:
        msg = f"Cannot determine country: Network error: {str(e)}"
        flag = False
        return flag, msg
    except Exception as e:
        msg = f"Internal system error while checking country: {str(e)}"
        flag = False
        return flag, msg

def get_system_mac():
    """
    Retrieves the MAC address of the current system.
    
    Returns:
        str: MAC address in uppercase, colon-separated format
    """
    mac = ':'.join(['{:02X}'.format((uuid.getnode() >> ele) & 0xff)
                 for ele in range(0,8*6,8)][::-1])
    return mac

def Check_Date(expiry_date):
    """
    Checks if the license is valid based on expiry date.
    Also provides an alert if license is close to expiring (within 30 days).
    
    Args:
        expiry_date: String in 'YYYY-MM-DD' format
        
    Returns:
        tuple: (is_valid: bool, message: str)
    """
    today = datetime.date.today()
    try:
        expiry = datetime.datetime.strptime(expiry_date, "%Y-%m-%d").date()
        
        # Calculate days until expiry
        days_until_expiry = (expiry - today).days
        
        if days_until_expiry < 0:
            return False, "License has expired."
        elif days_until_expiry <= 30:
            return True, f"License is valid but expires in {days_until_expiry} days. Please renew soon."
        else:
            return True, f"License is valid. Expires in {days_until_expiry} days."
            
    except Exception as e:
        return False, f"Date check error: {e}"

def Check_MAC(allowed_macs):
    """
    Checks if the current system's MAC address is in the allowed list.
    
    Args:
        allowed_macs: List of allowed MAC addresses
        
    Returns:
        tuple: (is_valid: bool, message: str)
    """
    # Get current system's MAC address
    current_mac = get_system_mac()
    print(f"Current MAC address: {current_mac}")
    
    if not allowed_macs:
        return False, "No allowed MAC addresses specified"
        
    if current_mac in allowed_macs:
        return True, "MAC address is allowed"
    else:
        return False, f"This license is not valid for this device (MAC: {current_mac})"

def Check_User_Count(license_key, new_user=False):
    """
    Checks if adding a new user would exceed the maximum allowed users.
    
    Args:
        license_key: The license key to check against
        new_user: Whether a new user is being added (True) or just checking (False)
    
    Returns:
        tuple: (is_valid: bool, message: str)
    """
    try:
        # Get maximum allowed users for this license
        max_users = get_max_users_for_license(license_key)
        
        # Store user count in a simple file (simulating database storage)
        # In production, this would be a database query
        user_count_file = f"user_count_{license_key}.txt"
        
        # Get current user count from storage
        try:
            with open(user_count_file, 'r') as f:
                current_users = int(f.read().strip())
        except FileNotFoundError:
            # If file doesn't exist, initialize user count to 0
            current_users = 0
        
        # If adding a new user, check if it would exceed the limit
        if new_user:
            if current_users >= max_users:
                return False, f"User count limit reached ({current_users}/{max_users}). Cannot add new user."
            else:
                # Increment user count and save
                current_users += 1
                with open(user_count_file, 'w') as f:
                    f.write(str(current_users))
                return True, f"New user added. Current user count: {current_users}/{max_users}"
        else:
            # Just checking current status
            if current_users >= max_users:
                return False, f"User count limit reached ({current_users}/{max_users})."
            else:
                return True, f"User count is within allowed limit ({current_users}/{max_users})."
    
    except Exception as e:
        return False, f"Error checking user count: {str(e)}"

# Helper function to get max users from license
def get_max_users_for_license(license_key):
    """
    Gets the maximum allowed users for a license key.
    In a real implementation, this would query your license database.
    
    Args:
        license_key: The license key to check
        
    Returns:
        int: Maximum allowed users
    """
    try:
        # This is where you would query your database
        # For demonstration purposes, we'll show a structure similar to a database check
        # without actually implementing the connection
        
        # Example structure of how a database query would work:
        # 1. Connect to database (not implementing actual connection here)
        # 2. Execute query: "SELECT max_users_allowed FROM licenses WHERE license_key = '{license_key}'"
        # 3. Fetch result and return
        
        print(f"Getting max users for license: {license_key}")
        
        # Simulate different licenses having different user limits
        # You would replace this with actual database lookup logic
        if license_key == "PREMIUM-123":
            return 50
        elif license_key == "STANDARD-456":
            return 25
        elif license_key == "BASIC-789":
            return 5
        else:
            # Default limit for any other license
            return 10
            
    except Exception as e:
        print(f"Error fetching max users: {str(e)}")
        return 10  # Default fallback value

def check_license(license_data, adding_new_user=False):
    """
    Performs all license checks using system information.
    
    Args:
        license_data: Dictionary containing license details:
            - license_key: Unique identifier for this license
            - allowed_countries: List of allowed country codes
            - expiry_date: License expiry date (YYYY-MM-DD)
            - allowed_macs: List of allowed MAC addresses
        adding_new_user: Whether this check is for adding a new user
    
    Returns:
        tuple: (is_valid: bool, message: str, details: dict)
    """
    results = {}
    is_valid = True
    messages = []
    
    # Country check - automatically gets current country
    country_flag, country_msg = check_country(license_data.get('allowed_countries'))
    results['country'] = {'valid': country_flag, 'message': country_msg}
    if not country_flag:
        is_valid = False
        messages.append(country_msg)
    
    # Date check
    date_flag, date_msg = Check_Date(license_data.get('expiry_date', '2099-12-31'))
    results['date'] = {'valid': date_flag, 'message': date_msg}
    if not date_flag:
        is_valid = False
        messages.append(date_msg)
    else:
        # Add warning message if close to expiry
        if "expires in" in date_msg and "Please renew soon" in date_msg:
            messages.append(date_msg)
    
    # MAC check - automatically gets current MAC
    mac_flag, mac_msg = Check_MAC(license_data.get('allowed_macs', []))
    results['mac'] = {'valid': mac_flag, 'message': mac_msg}
    if not mac_flag:
        is_valid = False
        messages.append(mac_msg)
    
    # User count check - will increment count if adding_new_user is True
    license_key = license_data.get('license_key', 'DEFAULT')
    user_flag, user_msg = Check_User_Count(license_key, adding_new_user)
    results['user_count'] = {'valid': user_flag, 'message': user_msg}
    if not user_flag:
        is_valid = False
        messages.append(user_msg)
    
    # Create overall message
    if is_valid:
        overall_message = "License is valid and active for this system."
        if messages:  # If there are warning messages but license is still valid
            overall_message += " However: " + "; ".join(messages)
    else:
        overall_message = "License validation failed: " + "; ".join(messages)
    
    return is_valid, overall_message, results

# Example usage:
if __name__ == "__main__":
    print("\n--- SYSTEM INFORMATION ---")
    print(f"Current MAC address: {get_system_mac()}")
    
    # Sample license data
    license_data = {
        'license_key': 'ABC-DEF-GHI-JKL',
        'allowed_countries': ["IN", "US", "MY"],
        'expiry_date': "2025-12-31",
        'allowed_macs': [get_system_mac()]
    }
    
    # Test just checking user count (without adding)
    print("\n--- CHECK LICENSE STATUS ---")
    is_valid, message, details = check_license(license_data, adding_new_user=False)
    print(f"License valid: {is_valid}")
    print(f"Message: {message}")
    
    # Test adding a new user
    print("\n--- ADD NEW USER ---")
    is_valid, message, details = check_license(license_data, adding_new_user=True)
    print(f"License valid: {is_valid}")
    print(f"Message: {message}")
    
    # Check status again after adding
    print("\n--- CHECK STATUS AFTER ADDING ---")
    is_valid, message, details = check_license(license_data, adding_new_user=False)
    print(f"License valid: {is_valid}")
    print(f"Message: {message}")

