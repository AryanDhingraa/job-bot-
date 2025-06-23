import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# Fetch variables
USER = os.getenv("PGUSER")
PASSWORD = os.getenv("PGPASSWORD")
HOST = os.getenv("PGHOST")
PORT = os.getenv("PGPORT")
DBNAME = os.getenv("PGDATABASE")

# Debug prints
print("\nDebug: Environment Variables:")
print(f"HOST: {HOST}")
print(f"PORT: {PORT}")
print(f"USER: {USER}")
print(f"DBNAME: {DBNAME}")

# Connect to the database
try:
    # Use individual parameters
    connection = psycopg2.connect(
        user=USER,
        password=PASSWORD,
        host=HOST,
        port=PORT,
        dbname=DBNAME
    )
    print("Connected successfully!")
    
    # Create a cursor to execute SQL queries
    cursor = connection.cursor()
    
    # Test queries
    print("\nRunning test queries:")
    
    # Get current time
    cursor.execute("SELECT NOW();")
    result = cursor.fetchone()
    print("1. Current Time:", result[0])
    
    # Get PostgreSQL version
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print("2. PostgreSQL version:", version[0])
    
    # List all tables
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    tables = cursor.fetchall()
    print("\n3. Available tables:")
    for table in tables:
        print(f"   - {table[0]}")

    # Close the cursor and connection
    cursor.close()
    connection.close()
    print("\nConnection closed successfully.")

except Exception as e:
    print(f"\nError: Failed to connect to the database!")
    print(f"Details: {str(e)}")
    print("\nPlease check your .env file and ensure all database credentials are correct.") 