## database.py
import sqlite3 as sql
from sqlite3 import Error
from os.path import dirname, abspath


class Database:
    
    # database file path
    db_path = f"{dirname(abspath(__file__))}/database1.db"

    # create airport table function
    def create_table_airport(self):
        # prim key = airportID -> icao code of airport
        new_db = sql.connect(self.db_path)  # connect to db
        db = new_db.cursor()  # cursor object
        db.execute(''' CREATE TABLE IF NOT EXISTS Airport(AirportID varchar(4) NOT NULL, 
                   AirportName varchar(255) NOT NULL, 
                   NumberOfRunways integer NOT NULL, 
                   Altitude integer NOT NULL, 
                   PRIMARY KEY(AirportID))''')
        new_db.commit()  # save changes
        new_db.close()  # close connection
        print("Table Airport is created")

    # create runway table function
    def create_table_runway(self):
        # airport id 
        # runway id = int 
        # runway length -> length of runway (in m)
        # runway heading -> bearing of runway
        new_db = sql.connect(self.db_path)  # connect to db
        db = new_db.cursor()  # cursor object
        db.execute(''' CREATE TABLE IF NOT EXISTS Runway (
                   RunwayID varchar(20) NOT NULL,
                   AirportID varchar(4) NOT NULL, 
                   RunwayLength integer NOT NULL, 
                   RunwayHeading varchar(3) NOT NULL, 
                   PRIMARY KEY(RunwayID))''')
        new_db.commit()  # save changes
        new_db.close()  # close connection
        print("Table Runway is created")

    # create coordinates table function
    def create_table_coordinates(self):
        new_db = sql.connect(self.db_path)  # connect to db
        db = new_db.cursor()  # cursor object
        db.execute(''' CREATE TABLE IF NOT EXISTS Coordinates (ID int NOT NULL, 
                   SecondaryID varchar(100) NOT NULL,
                   Latitude int NOT NULL, 
                   Longitude int NOT NULL, 
                   Type varchar(100) NOT NULL,
                   Country varchar(2) NOT NULL,
                   Continent varchar(2) NOT NULL,
                   Associated_Airport varchar(4),
                   PRIMARY KEY(ID))''')
        new_db.commit()  # save changes
        new_db.close()  # close connection
        print("Table Coordinates is created")

    # create aircraft table function
    def create_table_aircraft(self):
        new_db = sql.connect(self.db_path)  # connect to db
        db = new_db.cursor()  # cursor object
        db.execute(''' CREATE TABLE IF NOT EXISTS Aircraft(AircraftID varchar(255) NOT NULL, 
                   MaxFuelLoad int NOT NULL, 
                   CruiseSpeed int NOT NULL,
                   MaxAltitude int NOT Null, 
                   EngineID varchar(255) NOT NULL, 
                   NumberOfEngines int NOT NULL,
                   Manufacturer varchar(255) NOT NULL, 
                   EmptyWeight int NOT NULL, 
                   MaxPassenger int NOT NULL,
                   MaxWeight int NOT NULL,
                   Cargo int NOT NULL,
                   WingArea int NOT NULL,
                   RateOfClimb int NOT NULL,
                   PRIMARY KEY(AircraftID))''')
        new_db.commit()  # save changes
        new_db.close()  # close connection
        print("Table Aircraft is created")
    
    # create engine table function 
    def create_table_engine(self):
        new_db = sql.connect(self.db_path)  # connect to db
        db = new_db.cursor()  # cursor object
        db.execute(''' CREATE TABLE IF NOT EXISTS Engine (
                   EngineID varchar(255) NOT NULL, 
                   TSFC int NOT NULL, 
                   MaxThrust int NOT NULL,
                   Manufacturer varchar(255) NOT NULL,
                   PRIMARY KEY(EngineID))''')
        new_db.commit()  # save changes
        new_db.close()  # close connection
        print("Table Engine is created")

    
    def execute(self, query: str) -> None:
        '''
            execute insert, delete, update queries(queries that do not return any data)
            args:
                query: sql query
            return None
        '''
        db = sql.connect(self.db_path)  # connect to db
        cur = db.cursor()
        cur.execute(query)  # execute query
        db.commit()
        db.close()
        return True  # return True if successful
    
    # execute select query
    def select_query(self, query: str) -> tuple:
        '''
            execute select query (and queries that returns data)
            args:
                query: sql select query
            return [(data)]
        '''
        db = sql.connect(self.db_path)  # connect to db
        cur = db.cursor()  
        cur.execute(query)  # execute query
        record = cur.fetchall()  # fetch data 
        db.commit()
        db.close()  # close connection
        return record  # return data 

if __name__ == "__main__":
    DB = Database()

    for table in [ 'Airport', 'Aircraft', 'Engine', 'Coordinates', 'Runway']:
        DB.execute(f'''DROP TABLE IF EXISTS {table}''')

    DB.create_table_aircraft()
    DB.create_table_airport()
    DB.create_table_coordinates()
    DB.create_table_engine()
    DB.create_table_runway()
    # print()
    # DB.execute('''INSERT INTO "Airport" VALUES ("EGNM", "Leeds Bradford Airport", 1, 208), ("EGLL", "london heathrow airport", 2, 25) ''')

    # # Test DB4
    # print("TERMINAL")
    # DB = Database()
    # DB.execute('''UPDATE "Airport" SET AirportID = "LBA" WHERE AirportName = "Leeds Bradford Airport" ''')
    # d = DB.select_query(''' SELECT * FROM "Airport" ''')
    # print(f"\n\nReturn values: {d}")


    # DB.execute('''DELETE FROM "Airport" WHERE AirportID = "EGLL" ''')
    # d = DB.select_query(''' SELECT AirportName FROM "Airport" WHERE AirportID = "EGLL" ''')
    # db = sql.connect(f"{dirname(abspath(__file__))}/database1.db")  # connect to db
    # cur = db.cursor()
    # cur.execute('''SELECT * FROM "Airport" ''')  # select query
    # d = cur.fetchall()
    # db.commit()
    # db.close()

    query_aircrafts = '''INSERT INTO Aircraft (AircraftID, MaxFuelLoad, CruiseSpeed, MaxAltitude, EngineID, NumberOfEngines, Manufacturer, EmptyWeight, MaxPassenger, MaxWeight, Cargo, WingArea, RateOfClimb) VALUES 
    ('A321-251N', 24000, 458, 11887, 'PW1100G-JM', 2, 'Airbus', 48500, 244, 93500, 1, 122.4, 10.16), ('T-4', 2200, 450, 15240, 'F3-IHI-30', 2, 'Kawasaki', 3700, 2, 7500, 0, 21, 51),
    ('FA-18E', 6560, 573, 15000, 'F414-GE-400', 2, 'Boeing', 14552, 1, 29937, 0, 46.5, 228)'''
    query_engines = '''INSERT INTO Engine (EngineID, TSFC, MaxThrust, Manufacturer) VALUES 
    ('PW1100G-JM', 4.527, 156, 'Pratt and Whiteny'), ('F3-IHI-30', 5.5, 16.7, 'Ishikawajima-Harima Heavy Industries'),
    ('F414-GE-400', 0.77, 97.9, 'General Electric Aviation')'''

    DB.execute(query_aircrafts)
    DB.execute(query_engines)

