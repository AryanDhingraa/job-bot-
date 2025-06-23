"""
Database Connection Test Script
-----------------------------
This script will test your Supabase database connection.

Before running:
1. Create a .env file in the same directory as this script
2. Add your database URL from Supabase to the .env file
3. Run this script with: python test_connection.py
"""

import psycopg2
from dotenv import load_dotenv
import os

def test_database_connection():
    print("\n=== Database Connection Test ===\n")
    
    # 1. Check if .env file exists
    if not os.path.exists('.env'):
        print("❌ Error: .env file not found!")
        print("Please create a .env file with your database credentials.")
        return
    
    # 2. Load environment variables
    load_dotenv()
    database_url = os.getenv('DATABASE_URL')
    
    # 3. Check if DATABASE_URL is set
    if not database_url:
        print("❌ Error: DATABASE_URL not found in .env file!")
        print("\nPlease add your database URL to .env file like this:")
        print('DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres')
        print("\nYou can find this URL in:")
        print("1. Supabase Dashboard → Project Settings → Database")
        print("2. Look for 'Connection string' and click 'Show'")
        return
    
    # 4. Test connection
    try:
        print("Attempting to connect to database...")
        conn = psycopg2.connect(database_url)
        
        # Test query
        cursor = conn.cursor()
        cursor.execute('SELECT version();')
        version = cursor.fetchone()
        
        print("✅ Successfully connected to database!")
        print(f"\nPostgreSQL Version: {version[0].split(',')[0]}")
        
        # Close connections
        cursor.close()
        conn.close()
        print("\nConnection closed successfully.")
        
    except Exception as e:
        print("\n❌ Failed to connect to database!")
        print("\nCommon issues and solutions:")
        print("1. Check if your password is correct")
        print("2. Verify your project reference ID")
        print("3. Make sure your IP address is allowed in Supabase")
        print(f"\nError details: {str(e)}")

if __name__ == "__main__":
    test_database_connection() 