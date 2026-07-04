import sys
import subprocess
import time

# Auto-install boto3 if not installed
try:
    import boto3
except ImportError:
    print("boto3 not found. Installing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "boto3"])
    import boto3

from botocore.exceptions import ClientError

REGION = "ap-south-1"  # Mumbai, India
INSTANCE_NAME = "Bandhar-Enterprises-Server"
STATIC_IP_NAME = "Bandhar-Static-IP"
BLUEPRINT_ID = "ubuntu_22_04"
BUNDLE_ID = "nano_3_1"  # $5.00 USD/month dual-stack plan

# Startup script to configure Nginx and pull website files
USER_DATA = """#!/bin/bash
# Wait for apt lock to release
sleep 15
apt-get update -y
apt-get install -y nginx git

# Clean Nginx default page
rm -rf /var/www/html/*

# Clone the website repo
git clone https://github.com/rutujak-bora/Bandhar_Enterpirces.git /tmp/bandhar
mv /tmp/bandhar/* /var/www/html/
rm -rf /tmp/bandhar

# Ensure permissions
chown -R www-data:www-data /var/www/html

# Restart Nginx
systemctl restart nginx
systemctl enable nginx
"""

def deploy():
    print("Connecting to AWS Lightsail...")
    client = boto3.client('lightsail', region_name=REGION)
    
    # 1. Create Lightsail Instance
    print(f"Creating Lightsail instance '{INSTANCE_NAME}' in region {REGION}...")
    try:
        client.create_instances(
            instanceNames=[INSTANCE_NAME],
            availabilityZone=f"{REGION}a",
            blueprintId=BLUEPRINT_ID,
            bundleId=BUNDLE_ID,
            userData=USER_DATA
        )
        print("Instance creation initiated successfully.")
    except ClientError as e:
        if "AlreadyExists" in str(e):
            print(f"Instance '{INSTANCE_NAME}' already exists. Skipping creation.")
        else:
            print(f"Error creating instance: {e}")
            return

    # 2. Allocate Static IP
    print(f"Allocating Static IP '{STATIC_IP_NAME}'...")
    static_ip = None
    try:
        response = client.allocate_static_ip(staticIpName=STATIC_IP_NAME)
        static_ip = response['operations'][0]['resourceName']
        print(f"Allocated Static IP: {static_ip}")
    except ClientError as e:
        if "AlreadyExists" in str(e):
            print(f"Static IP '{STATIC_IP_NAME}' already exists. Fetching existing IP...")
            try:
                ip_info = client.get_static_ip(staticIpName=STATIC_IP_NAME)
                static_ip = ip_info['staticIp']['ipAddress']
                print(f"Existing Static IP Address: {static_ip}")
            except Exception as ex:
                print(f"Error getting static IP info: {ex}")
        else:
            print(f"Error allocating IP: {e}")
            return

    # 3. Wait for instance to be in running state
    print("Waiting for the instance to start up (this takes ~30-45 seconds)...")
    while True:
        try:
            instance_info = client.get_instance(instanceName=INSTANCE_NAME)
            state = instance_info['instance']['state']['name']
            print(f"Current instance state: {state}")
            if state == "running":
                break
        except Exception as e:
            print(f"Waiting for instance check: {e}")
        time.sleep(10)

    # 4. Attach Static IP
    print(f"Attaching Static IP '{STATIC_IP_NAME}' to '{INSTANCE_NAME}'...")
    try:
        client.attach_static_ip(
            staticIpName=STATIC_IP_NAME,
            instanceName=INSTANCE_NAME
        )
        print("Static IP attached successfully.")
    except ClientError as e:
        print(f"Info/Error attaching IP: {e} (might already be attached)")

    # 5. Open HTTP (80) and HTTPS (443) ports
    print("Opening ports 80 (HTTP) and 443 (HTTPS) on the server firewall...")
    try:
        client.open_instance_public_ports(
            portInfo={'fromPort': 80, 'toPort': 80, 'protocol': 'tcp'},
            instanceName=INSTANCE_NAME
        )
        client.open_instance_public_ports(
            portInfo={'fromPort': 443, 'toPort': 443, 'protocol': 'tcp'},
            instanceName=INSTANCE_NAME
        )
        print("Firewall ports opened successfully.")
    except ClientError as e:
        print(f"Info/Error opening ports: {e}")

    # Fetch final public static IP info
    try:
        ip_info = client.get_static_ip(staticIpName=STATIC_IP_NAME)
        ip_address = ip_info['staticIp']['ipAddress']
        print("\n" + "="*50)
        print("🎉 DEPLOYMENT SUCCESSFUL!")
        print("="*50)
        print(f"Your static IP address is: {ip_address}")
        print(f"Webpage URL: http://{ip_address}")
        print("Point your domain A-record to this IP address in GoDaddy/domain registrar.")
        print("Note: Nginx initialization and Git clone will complete in 1-2 minutes.")
        print("="*50 + "\n")
    except Exception as e:
        print(f"Completed, but error fetching final IP details: {e}")

if __name__ == "__main__":
    try:
        deploy()
    except Exception as e:
        print(f"Deployment failed: {e}")
