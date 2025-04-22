## aircraft.py
from database import Database

class Aircraft:
    '''
        Get parameters of an aircraft 
        1. max range
        2. fuel burn after t hours
        etc
    '''
    def __init__(self, aircraft: str):  # get all aircraft related variables required for the class
        '''
            args:
                aircraft: aircraft model
        '''
        self.aircraft = aircraft
        DB = Database()
        # get engine and aircraft data
        query = f''' SELECT Aircraft.CruiseSpeed, Aircraft.EngineID, Engine.TSFC, Engine.MaxThrust, 
                    Aircraft.NumberOfEngines, Aircraft.RateOfClimb, Aircraft.MaxFuelLoad
                        FROM Aircraft, Engine 
                        WHERE Aircraft.AircraftID = '{aircraft}' AND Engine.EngineID = Aircraft.EngineID'''
        record = DB.select_query(query)[0]
        # set constants for the class from the data fetched from db
        self.cruise_speed_in_knts, self.engine, self.tsfc, self.thrust, self.numEngines, self.rate_of_climb, self.maxFuel = record

        # calculate fuel rate
        self.fuel_rate = self.tsfc * self.thrust  # kg/hour
        # cruise tas(true air speed) in kmh-1
        self.speed_in_kmh = self.cruise_speed_in_knts * 1.852  

    def maxRange(self) -> float:
        '''
            calculate the max range of the aircraft
            return range in km
        '''
        # print(self.maxFuel, self.numEngines)
        fuelpEngine = self.maxFuel / self.numEngines  # fuel for each engine
        # print(fuelpEngine, self.fuel_rate)
        time = fuelpEngine/ self.fuel_rate  # time to burn all fuel  # in hours
        # print(time, self.speed_in_kmh)
        range_ = time * self.speed_in_kmh  # in km
        return range_


    def fuelburn(self, time: int) -> float:
        '''
            calculate fuel burned after t hours
            args:
                time: time of flight in hours
            return fuel_load for n engines
        '''
        fuel = self.fuel_rate * time  # get fuel usage for t amount of hours for one engine
        fuel_total = fuel * self.numEngines  # engine multiplier
        return fuel_total  # in kg
    
    def fueltime(self, distance: int, altitude: int, source_: str, destination_:str, wind = None) -> tuple:
        '''
            calculate fuel required for the flight
            args:
                distance: distance of flight
                altitude: cruise altitude of flight (above mean sea level) in m
                source: departure airport id
                destination: destination airport id
                wind: head/tailwind during flight in knots(head = - / tail = +)
            return fuel in kg, time in hours
        '''

        # get altitude of each airport
        DB = Database()
        airport_query = f'''SELECT AirportID, Altitude FROM Airport WHERE AirportID in ('{source_}', '{destination_}')'''
        record = DB.select_query(airport_query)

        # sort the record in order
        if record[0][0] == source_:
            source_alt = record[0][1]
            destination_alt = record[1][1]
        elif record[1][0] == source_:
            source_alt = record[1][1]
            destination_alt = record[0][1]

        em_fuel = self.fuelburn(0.75)  # 45 minutes of emergency fuel
        v = self.speed_in_kmh  # cruise speed
        if wind:  # if there is wind
            wind = wind * 1.852  # convert wind speed from knots into kmh-1
        else:
            wind = 0
            
        flight_time = distance / (v + wind)  # flight time in hours
        cruise_fuel = self.fuelburn(flight_time)  # fuel for cruise

        climb_time_in_s = (altitude - source_alt)/self.rate_of_climb  # time for ascend in seconds
        climb_time = climb_time_in_s / 3600  # time in hours
        climb_fuel = self.fuelburn(climb_time)  # fuel for ascending

        descent_time_in_s = (altitude - destination_alt) / self.rate_of_climb  # time for descend in seconds
        descent_time = descent_time_in_s / 3600  # time in hours
        descent_fuel = self.fuelburn(descent_time)  # fuel for descending

        total_fuel = cruise_fuel + climb_fuel + descent_fuel + em_fuel  # total fuel
        total_time = flight_time + climb_time + descent_time
        return (total_fuel, total_time)  # return fuel required and estimate time for flight 

if __name__ == "__main__":

    # Test A2
    print("\nTerminal")
    fuel, time = Aircraft("FA-18E").fueltime(distance=100, altitude=1000, source_="EGLL", destination_="EGNM")

    print(f"Fuel: {fuel}")
    print(f"Time: {time}")

    