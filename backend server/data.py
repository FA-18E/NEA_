## data.py
import pandas as pd
from database import Database
from os.path import dirname, abspath
from geopy.distance import geodesic
from json import dumps, load
from datetime import datetime
import math
import geopandas as gpd
from shapely.geometry import Polygon, Point, LineString
import numpy as np
import geopandas as gpd
from shapely.geometry import Point, Polygon, LineString
from scipy.spatial import cKDTree
from geopy.distance import geodesic
import json

class Data:

    directory = f"{dirname(abspath(__file__))}"
    def readcsv(self, fileName: str, usecol = None) -> list:
        '''
            CSV
            read csv and return csv values
            args:
                fileName: name of csv file stored in folder db_
                usecol: default = None -> select columns to read
            return list of values
        '''
        path = f"{self.directory}/db_/{fileName}"
        if usecol:  # select all columns
            csv_ = pd.read_csv(path, usecols=usecol)
        else:
            csv_ = pd.read_csv(path)
        return csv_ 
    
    def select_row(self, fileName: str, conditionID: str, condition: any, usecol = None) -> dict:
        '''
            CSV
            read csv and return values
            args:
                fileName: name of csv file stored in folder db_
                conditionID: name of the condition field/column that the condition belongs to (eg 'ident')
                condition: id of the row (eg 'EGLL' etc) * csv[conditionID] == condition
                usecol: default = None -> select columns to read
            return dict of values
        ''' 
        if usecol:
            csv_ = self.readcsv(fileName, usecol)  # only fetch specified columns
        else:
            csv_ = self.readcsv(fileName)  # fetch all
        row = csv_[csv_[conditionID] == condition]  # fetch data by from column using conditions
        return row.to_dict()

    def log_data(self, data):
        with open("log.txt", "a") as f:  # append new item into .txt
            f.write(f"\n{datetime.now()} - {data}\n")

    def insert_airports(self, airports: list, show = False) -> None:
        '''
            DB
            get airport info from csv and insert it inot the database table 'Airport'
            args:
                airports: list of airports icao to insert
                show: show & print process * False by default *(True = show / False = dont show)
        '''
        DB = Database()
        for airport in airports:

            # get airport & runway info from airports.csv and runways.csv
            ap_data = self.select_row("airports.csv", "ident", airport, 
                                      ["ident", "name", "latitude_deg", "longitude_deg", "iso_country", "elevation_ft", "continent"],)
            rw_data = self.select_row("runways.csv", "airport_ident", airport, 
                                      ["airport_ident", "le_ident", "length_ft", "le_heading_degT"])

            
            index_, lat = ap_data["latitude_deg"].popitem()  # get index of current airport in the csv

            lon = ap_data["longitude_deg"][index_]
            country = ap_data["iso_country"][index_]
            continent = ap_data["continent"][index_]
            elevation_m = (ap_data["elevation_ft"][index_]) / 3.281  # convert elevation from feet to m
            name = ap_data["name"][index_]
            num_runways = len(rw_data["le_ident"])

            # easiest way to check if airport is already in table
            record = DB.select_query(f'''SELECT * FROM Airport WHERE AirportID = '{airport}' ''')

            if record:
                if show:
                    print(f"Airport {airport} already exist")
                continue

            if show:
                print("\n", index_, lat, lon, country, continent, elevation_m, name, num_runways, rw_data["le_ident"] )

            for _index_ in rw_data["le_ident"]:  # get runway data for each airport
                runwayid = f"{airport}-{rw_data['le_ident'][_index_]}"
                length_m = (rw_data["length_ft"][_index_]) / 3.281  # convert runway length from feet to m
                heading = rw_data["le_heading_degT"][_index_]

                if show:
                    print(_index_, runwayid, length_m, heading)

                if math.isnan(heading) or math.isnan(length_m):  # if nan -> skip loop
                    self.log_data(f"NaN - insert_airports - {runwayid}")
                    print(f"\nNaN - insert_airports - {runwayid}\n")
                    continue
                    
                # insert runway data into db
                query_runway = f'''INSERT INTO Runway (AirportID, RunwayID, RunwayLength, RunwayHeading) VALUES 
                ('{airport}', '{runwayid}', {length_m}, {heading})'''
                
                exe1 = DB.execute(query_runway)

            if '"' in name:
                name = name.replace('"', ' ')
            
            # insert airport data into db
            query_airport = f'''INSERT INTO Airport (AirportID, AirportName, NumberOfRunways, Altitude) VALUES 
            ("{airport}", "{name}", {num_runways}, {elevation_m})'''

            if math.isnan(num_runways) or math.isnan(elevation_m):
                self.log_data(f"NaN - insert_airports - {airport} - {name}")
                print(f"\nNaN - insert_airports - {airport} - {name}\n")
                continue
            
            exe2 = DB.execute(query_airport)

            query_coords = f'''INSERT INTO Coordinates (ID, SecondaryID, Latitude, Longitude, Type, Country, Continent) VALUES
            ({index_}, "{airport}", {lat}, {lon}, 'Airport', '{country}', '{continent}' )'''
            exe3 = DB.execute(query_coords)


    def insert_navaids_by_country(self, countries: list, show=False):
        '''
            DB
            find all navaids in a country and insert them into the table 'Coordinates'
            args:
                countries: list of iso country codes
                show: show & print process * False by default *(True = show / False = dont show)
        '''
        DB = Database()
        for country in countries:
            # get navaids for country from csv
            navs = self.select_row("navaids.csv", "iso_country", country, 
                                   ["filename", "type", "latitude_deg", "longitude_deg", "associated_airport", "iso_country"])
            
            for index, (nav_index) in enumerate(navs["filename"]):
                # insert each waypoint in navs list into coordinates table
                ident = navs["filename"][nav_index]
                lat = navs["latitude_deg"][nav_index] 
                lon = navs["longitude_deg"][nav_index]
                
                type_ = navs["type"][nav_index]
                country = navs["iso_country"][nav_index]
                associated_airport = navs["associated_airport"][nav_index]

                continent_dt = self.select_row("regions.csv", "iso_country", country, ["continent", "iso_country"])
                _, continent = continent_dt["continent"].popitem()

                # check if waypoint exists in database
                record = DB.select_query(f'''SELECT * FROM Coordinates WHERE SecondaryID = "{ident}" AND Latitude = {lat} AND Longitude = {lon} ''')
                if record:
                    print(f"Nav {ident} already exist")
                    continue

                if show:
                    print(nav_index, ident, lat, lon, type_, country, continent, associated_airport)
                
                if math.isnan(lat) or math.isnan(lon):  # if nan -> skip loop
                    self.log_data(f"NaN - insert_navaids_by_country - {ident}")
                    print(f"\nNaN - insert_navaids_by_country - {ident}\n")
                    continue
                
                ex = False  # exception
                if str(associated_airport) == "nan":
                    query = f'''INSERT INTO Coordinates (ID, SecondaryID, Latitude, Longitude, Type, Country, Continent) VALUES 
                    ({nav_index}, "{ident + str(nav_index)}", {lat}, {lon}, '{type_}', '{country}', '{continent}') '''
                else:
                    try:
                        query =  f'''INSERT INTO Coordinates (ID, SecondaryID, Latitude, Longitude, Type, Country, Continent, Associated_Airport) VALUES 
                            ({nav_index}, "{ident + str(nav_index)}", {lat}, {lon}, '{type_}', '{country}', '{continent}', '{associated_airport}' ) '''
                    except Exception as e:
                        print(e)
                        ex =True
                if not ex:
                    try:
                        exe1 = DB.execute(query)  # insert query
                    except Exception as e:
                        print(e)
            if show:
                print(index)  # number of loops = number of navaids

    def get_airport_by_country(self, countries: list, include_small_airports=True):
        '''
            get all airports in a/multiple country(ies)
            args:
                countries: list of iso country code
                include_small_airports: include small airports during fetch of airports -> default = true
        '''
        csv_ = self.readcsv("airports.csv", ["name", "iso_country", "type", "ident"])
        icao_s = []  # list of icao codes in country specified in the list 'countries'
        for country in countries:
            if include_small_airports:
                # select all small, medium, large airports in the country
                record = csv_[(csv_["iso_country"] == country) & (csv_["type"].isin(["small_airport", "medium_airport", "large_airport"]))]  
            else:
                # select all medium, large airports in the country
                record = csv_[(csv_["iso_country"] == country) & (csv_["type"].isin(["medium_airport", "large_airport"]))]  
            record = record.to_dict()
            for airport_index in record["name"]:
                airport_icao = record["ident"][airport_index]
                icao_s.append(airport_icao)
        return icao_s
    
    def add_data_by_country(self, countries: list, include_small_airports=True, showProcess=False, file=None):
        '''
            JSON
            DB
            get all airport and navaid in a country and insert them into corresponding files to create a network
            args:
                countries: list of iso country code
                include_small_airports: include small airports during fetch of airports -> default = true
                showProcess: show and print process -> default = False
                file: name of json file to write connections -> default = connections.json * full name including .json if not default *
        '''
        airports = self.get_airport_by_country(countries, include_small_airports)  # get airport data
        self.insert_airports(airports, show=showProcess)  # add airport data into database
        self.insert_navaids_by_country(countries, show=showProcess)  # add waypoint data into database


    def get_nodes(self, source: str, target: str, padding: int=1) -> list:
        '''
            get all nodes between 2 airports
            args:
                source: source airport icao code 
                end: destination airport icao code
                padding: extra area to fetch node in  // default = 1 degrees
            return list of nodes [(airport 1 lat, lon), (airport2 lat, lon), (waypoint1 lat, lon), .....]
        '''
        DB = Database()
        # select airport coordinates
        query = f'''SELECT SecondaryID, Latitude, Longitude, Type, 
        Associated_Airport, ID FROM Coordinates WHERE SecondaryID in ("{source}", "{target}")'''
        record = DB.select_query(query)  # airport list
        ident_a, ident_b = record[0][0], record[1][0]

        if ident_b == source:  # resverse list if not in order of source - target
            record = record[::-1]

        lat_source, lon_source = record[0][1], record[0][2]  # latitude and longitude of source node
        lat_target, lon_target = record[1][1], record[1][2]  # latitude and longitude of destination node

        # coordinates for padding
        # max = coord + padding  // min = coord - padding
        max_lat = max(lat_source, lat_target) + padding  # max latitude 
        max_lon = max(lon_source, lon_target) + padding  # max longitude
        min_lat = min(lat_source, lat_target) - padding  # min latitude
        min_lon = min(lon_source, lon_target) - padding  # min longitude

        # create select query for db 
        query_waypoints = f'''SELECT SecondaryID, Latitude, Longitude, Type, Associated_Airport, ID FROM Coordinates 
        WHERE Latitude <= {max_lat} AND Latitude >= {min_lat} 
        AND Longitude <= {max_lon} AND Longitude >= {min_lon} 
        AND Type != "Airport" '''

        waypoints = DB.select_query(query_waypoints)  # get data 
        
        return record + waypoints  
    
    def create_graph(self, source: str, target: str, restricted_airspace: list=None, padding_restricted: int=4, max_connect_dis: int=300) -> dict:
        '''
        create a graph to find the shortest path
        args:
            source: departure airport icao code
            target: destination airport icao code
            restricted_airspace: list of vertices of the restricted airspace polygon
            padding_restricted: padding to select node when restricted airspace is present // default=4
            max_connect_dis: maximum connection distance of nodes in km // default = 300
        return graph{"graph":{{}, ...}, "coords":{{}, ...}}
        '''

        padding = 1  # fetch coords padding = 1 degrees lat&lon
        if restricted_airspace != None:
            padding = padding_restricted  # fetch more coords because of restricted airspace
        node_list = self.get_nodes(source, target, padding=padding)  # get all nodes in box
        
        # gen graph
        graph = self.gen_mesh(node_list, restricted_airspace=restricted_airspace, max_connection_dis=max_connect_dis)
        return graph

    def gen_mesh(self, node_list, restricted_airspace: list = None, max_connection_dis: int=290) -> dict:
        """
        Optimize node connection process using spatial indexing and vectorized operations.
        args:
            node_list: list of nodes to used to generate the mesh (generated from get nodes function) ([id, lat, lon, type, associated ap, unique id])
            restricted_airspace: list of vertices(coord of vertices) of the restricted airspace polygon
            max_connection_dis: maximum connection distance. the max separation from each node for it to be connected
        """
        '''
            rules:
                1. airports can only connect nodes within a 25km radius -> check ap distance
                2. waypoints cannot connect with other waypoints that is over 200km away -> check distance
                3. nodes connection must not pass through restricted airspace -> check restricted airspace
                4. nodes with associated airport cannot connect to nodes with associated airport -> check associated airport
        '''
        def latlon_to_cartesian(lat, lon, R=6371):  # Approximate Earth radius in km
            lat, lon = np.radians(lat), np.radians(lon)  # get lat and lon in radians
            x = R * np.cos(lat) * np.cos(lon)
            y = R * np.cos(lat) * np.sin(lon)
            z = R * np.sin(lat)
            return x, y, z

        
        # print(f"Total Nodes: {len(node_list)}")

        # Convert restricted airspace into a Shapely Polygon
        restricted_polygon = Polygon(restricted_airspace) if restricted_airspace else None
        restricted_tree = gpd.GeoSeries(restricted_polygon) if restricted_polygon else None

        # Graph structure
        graph = {"graph": {}, "coords": {}}

        # Extract node positions for fast lookup
        # Convert all nodes
        node_positions_3d = np.array([latlon_to_cartesian(lat, lon) for _, lat, lon, _, _, _ in node_list])

        # Build a KDTree with 3D coordinates
        kdtree = cKDTree(node_positions_3d)

        # Precompute restricted nodes
        restricted_nodes = set()
        if restricted_polygon:
            for sid, lat, lon, *_ in node_list:
                if restricted_tree.contains(Point(lat, lon))[0]:
                    restricted_nodes.add(sid)

        # Process nodes
        for idx, (sid, lat, lon, ty, ap, uid) in enumerate(node_list):
            # print(f"Processing Node {idx+1}/{len(node_list)}: {sid}")

            if sid in restricted_nodes and ty != "Airport":
                continue  # Skip restricted waypoints
            elif sid in restricted_nodes and ty == "Airport":
                return "airport in restricted airspace"
            else:
                pass
            graph["coords"][sid] = {"lat": lat, "lon": lon}
            graph["graph"][sid] = {}

            # Query KDTree for nearby nodes (within 290km)
            # Query using 3D coordinates
            query_point_3d = latlon_to_cartesian(lat, lon)
            nearby_indices = kdtree.query_ball_point(query_point_3d, r=max_connection_dis)  # Approximate sphere radius

            for j in nearby_indices:
                sid2, lat2, lon2, ty2, ap2, uid2 = node_list[j]
                # sid=secondary id, ty=type, ap=associated airport, uid=unique id
                if sid == sid2:
                    continue  # Skip self-connections

                # Compute geodesic distance
                distance = geodesic((lat, lon), (lat2, lon2)).km

                # Connection rules
                connect = False

                # Rule 1: Airports only connect within 25km
                if ty == "Airport" and ap2 == sid:
                    connect = True
                elif ty == "Airport":
                    continue

                # Rule 2: Max connection distance
                if distance > max_connection_dis:
                    continue

                # Rule 3: Check restricted airspace intersection
                if restricted_polygon:
                    line = LineString([(lat, lon), (lat2, lon2)])
                    if line.intersects(restricted_polygon):
                        continue

                # Rule 4: Associated airports should not connect
                if ap and ap2 and distance < 150:
                    continue

                # Add connection
                if connect or (not restricted_polygon or not line.intersects(restricted_polygon)):
                    graph["graph"][sid][sid2] = distance

        # Save graph to JSON
        json_obj = dumps(graph, indent=4)
        with open(f"{self.directory}/graphs/{node_list[0][0]}-{node_list[1][0]}.json", "w") as f:
            f.write(json_obj)

        # print("Graph generation complete!")
        return graph


if __name__ == "__main__":
    
    # DB = Database()
    # # drop and create table
    # for table in [ 'Airport', 'Aircraft', 'Engine', 'Coordinates', 'Runway']:
    #     DB.execute(f'''DROP TABLE IF EXISTS {table}''')

    # DB.create_table_aircraft()
    # DB.create_table_airport()
    # DB.create_table_coordinates()
    # DB.create_table_engine()
    # DB.create_table_runway()

    # print("\nTerminal")
    # country_list = ["GB"]
    # # select all navaids in taiwan and print each navaid
    # D.add_data_by_country(countries=country_list, include_small_airports=False, showProcess=False)

    # Test D9
    D = Data()
    # # get nodes
    # print("\nTerminal")
    # for dis in [300, 290]:
    #     g = D.create_graph(source="EGLL", target="EGNM", max_connect_dis=dis)
    #     c = 0
    #     # get number of connections
    #     for node in g["graph"]:
    #         c += len(g["graph"][node])
    #     print(f"Max connection distance: {dis}")
    #     print(f"Number of connections in json: {c}")
    #     print(f"Number of nodes in json: {len(g["coords"])}\n\n")

    
    
    # x = D.get_nodes(source="EGLL", target="EGNM")
    # print(f"node list length: {len(x)}")

    # # gen mesh
    # g = D.gen_mesh(x)
    # print(f"Number of nodes in graph: {len(g["graph"])}")

    # with open(f"{dirname(abspath(__file__))}/graphs/EGLL-EGNM.json", "r") as f:
    #     j = load(f)

    # for source in ["EGLL", "EGCC"]:
    #     print(f"\n\nSource: {source}, Target: EGNM ")
    #     x = D.get_nodes(source=source, target="EGNM")
    #     print(f"node list length: {len(x)}")

    #     # gen mesh
    #     g = D.gen_mesh(x)
    #     print(f"Number of nodes: {len(g["graph"])}")
    #     c = 0
    #     # get number of connections
    #     for node in g["graph"]:
    #         c += len(g["graph"][node])
    #     print(f"Number of connections: {c}")
    # # select * from coordiantes
    # d = DB.select_query('''SELECT * FROM "Coordinates" ''')  
    # # print(f"\n\nReturned: {d}")
    # print(f"Length Coordinates: {len(d)}")

    # # select * from airport
    # d = DB.select_query('''SELECT * FROM "Airport" ''')  
    # #print(f"\n\nReturned: {d}")
    # print(f"Length Airport: {len(d)}")



    # print("\nTERMINAL")  # D2
    # # drop and create tables
    # for table in [ 'Airport', 'Aircraft', 'Engine', 'Coordinates', 'Runway']:
    #     DB.execute(f'''DROP TABLE IF EXISTS {table}''')

    # DB.create_table_aircraft()
    # DB.create_table_airport()
    # DB.create_table_coordinates()
    # DB.create_table_engine()
    # DB.create_table_runway()

    # # insert airport
    # airport_list = ["EGLL"]
    # D.insert_airports(airports=airport_list, show=True)

    # # select data
    # d = DB.select_query('''SELECT * FROM "Airport" ''')
    # print(f"\nAirport data: {d}")
    # d = DB.select_query('''SELECT * FROM "Runway" ''')
    # print(f"\nRunway data: {d}")

    



    # country_list =["TW"]
    # l = [True, False]
    # for small_airport in l:
    #     x = D.get_airport_by_country(countries=country_list, include_small_airports=small_airport)
    #     print(f"\n\nSmall airport: {small_airport}")
    #     print(f"Return: {x}")
    #     print(f"len list: {len(x)}")

    # print("\nTERMINAL")
    # airport_list = ["EGLL"]
    # D.insert_airports(airports=airport_list, show=True)

    lis1 = ["GB", "DE", "ES", "FR", "IT"]
    lis2 = ["IS", "PT", "FI", "SE", "NO"]
    lis3 = [ "HK", "JP", "PH", "TW"]
    D.add_data_by_country(["GB"], False, True)

    # D.insert_airports(["EGLL"], show=True)
    