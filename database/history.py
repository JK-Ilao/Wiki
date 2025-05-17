import sqlite3
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
from zoneinfo import ZoneInfo


def parse_html_to_excel_and_db(input_file, output_file, db_file, table_name, filter_date=None):
    # Load the HTML content
    with open(input_file, "r", encoding="utf-8") as file:
        html_content = file.read()

    # Parse the HTML using BeautifulSoup
    soup = BeautifulSoup(html_content, "html.parser")

    # Initialize an empty list to store the extracted data
    data = []

    # Find all message containers
    messages = soup.find_all("div", class_="chatlog__message-container")

    for message in messages:
        # Extract timestamp
        timestamp_tag = message.find("span", class_="chatlog__timestamp")
        if not timestamp_tag:
            # Fallback to chatlog__short-timestamp if chatlog__timestamp is missing
            timestamp_tag = message.find("div", class_="chatlog__short-timestamp")
        timestamp = None

        if timestamp_tag:
            # Prioritize extracting the timestamp from the title attribute
            if timestamp_tag.has_attr("title"):
                timestamp = timestamp_tag["title"]
            elif timestamp_tag.text.strip():
                timestamp = timestamp_tag.text.strip()

        # Parse the timestamp into a datetime object
        if timestamp:
            try:
                message_date = datetime.strptime(timestamp, "%d-%b-%y %I:%M %p")
            except ValueError:
                message_date = datetime.strptime(timestamp, "%A, %B %d, %Y %I:%M %p")

            # Convert to UTC (replace 'Your/Timezone' with your actual timezone, e.g., 'America/New_York')
            local_tz = ZoneInfo("Europe/Bucharest")  # Replace with your local timezone
            message_date = message_date.replace(tzinfo=local_tz)
            message_date_utc = message_date.astimezone(ZoneInfo("UTC"))
            timestamp = int(message_date_utc.timestamp())

            # Skip entries before the filter_date (also convert filter_date to UTC for comparison)
            if filter_date:
                filter_date_utc = filter_date.replace(tzinfo=local_tz).astimezone(ZoneInfo("UTC"))
                if message_date_utc <= filter_date_utc:
                    continue

        # Extract Pokémon name
        pokemon_icon = message.find("img", class_="chatlog__embed-author-icon")
        pokemon_name = pokemon_icon["alt"] if pokemon_icon else None

        # Extract spawn type (e.g., "LEGENDARY ALERT!" or "LEGENDARY CAPTURED!")
        spawn_type_tag = message.find("div", class_="chatlog__embed-field-name")
        if not spawn_type_tag:
            spawn_type_tag = message.find("div", class_="chatlog__embed-title")
        spawn_type = spawn_type_tag.text.strip() if spawn_type_tag else None

        # Extract location, player name, and Pokémon name
        field_value_tag = message.find("div", class_="chatlog__embed-field-value")
        if not field_value_tag or not field_value_tag.text.strip():
            field_value_tag = message.find("div", class_="chatlog__embed-description")

        if field_value_tag:
            field_value = field_value_tag.text.strip()
            normalized_field_value = field_value.lower()  # Normalize to lowercase for case-insensitive comparison
            
            if "has spawned in" in normalized_field_value and "near" in normalized_field_value:
                if "a legendary" in normalized_field_value:
                    parts = field_value.split(" has spawned in ")
                    pokemon_name = parts[0].replace("A legendary ", "").strip()
                elif "an ultra beast" in normalized_field_value:
                    parts = field_value.split(" has spawned in ")
                    pokemon_name = parts[0].replace("An ultra beast ", "").strip()
                
                if len(parts) > 1 and " near " in parts[1]:
                    location, player_name = parts[1].split(" near ")
                    location = location.strip()
                    player_name = player_name.strip().rstrip("!")  # Remove trailing "!"
                else:
                    location, player_name = None, None
            elif "has been captured by" in normalized_field_value:
                if "the legendary" in normalized_field_value:
                    parts = field_value.split(" has been captured by ")
                    pokemon_name = parts[0].replace("The legendary ", "").strip()
                elif "the ultrabeast" in normalized_field_value:
                    parts = field_value.split(" has been captured by ")
                    pokemon_name = parts[0].replace("The ultrabeast ", "").strip()
                
                location = None  # No location in this case
                player_name = parts[1].strip().rstrip("!") if len(parts) > 1 else None
            else:
                pokemon_name, location, player_name = None, None, None
        else:
            pokemon_name, location, player_name = None, None, None

        # Debugging: Print extracted values
        # print(f"Extracted: Timestamp={timestamp}, Pokémon Name={pokemon_name}, Spawn Type={spawn_type}, Location={location}, Player Name={player_name}")

        # Append the extracted data to the list
        if timestamp and pokemon_name and spawn_type:
            data.append({
                "Timestamp": timestamp,
                "Pokémon Name": pokemon_name,
                "Spawn Type": spawn_type,
                "Location": location,
                "Player Name": player_name
            })

    # Convert the data into a pandas DataFrame
    df = pd.DataFrame(data)

    # Export the DataFrame to an Excel file
    # df.to_excel(output_file, index=False)

    # Insert the data into the SQLite3 database
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    # Create the table if it doesn't exist
    cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS {table_name} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            Timestamp TEXT,
            Pokemon_Name TEXT,
            Spawn_Type TEXT,
            Location TEXT,
            Player_Name TEXT
        )
    """)

    # Insert data into the table
    for _, row in df.iterrows():
        # Check if the entry already exists
        cursor.execute(f"""
            SELECT COUNT(*) FROM {table_name}
            WHERE Timestamp = ? AND Pokemon_Name = ? AND Player_Name = ? AND Spawn_Type = ?
        """, (row["Timestamp"], row["Pokémon Name"], row["Player Name"], row["Spawn Type"]))
        
        # Fetch the result
        exists = cursor.fetchone()[0]
        
        # Insert only if the entry does not exist
        if exists == 0:
            cursor.execute(f"""
                INSERT INTO {table_name} (Timestamp, Pokemon_Name, Spawn_Type, Location, Player_Name)
                VALUES (?, ?, ?, ?, ?)
            """, (row["Timestamp"], row["Pokémon Name"], row["Spawn Type"], row["Location"], row["Player Name"]))
    # Commit and close the database connection
    conn.commit()
    conn.close()

    print(f"Data has been exported to {output_file} and inserted into the {table_name} table in {db_file}")


# Example usage
filter_date = datetime.strptime("19-Apr-25", "%d-%b-%y")  # Set your desired filter date
parse_html_to_excel_and_db(
    "history_legendaryt.html",
    "legendary_spawns_filtered.xlsx",
    "Legendarys.db",
    "LegendarySpawns",
    filter_date
)
parse_html_to_excel_and_db(
    "history_ub.html",
    "ultra_beasts_spawns_filtered.xlsx",
    "Legendarys.db",
    "UltraBeastSpawns",
    filter_date
)