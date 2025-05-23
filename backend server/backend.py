## backend.py
from path import Path
from data import Data
from aircraft import Aircraft
from json import load, dumps

class Backend:

    def create_plan(self, source: str, target: str, aircraft_model: str, add_to_map: bool=False, 
                    group_name: str=None, restricted_airspace: list= None, altitude: int=4000) -> dict:
        '''
        create a flight plan
        args:
            source: departure airport id
            target: arrival airport id
            aircraft_model: model of aircraft
            add_to_map: true or false, add to the map in mapview or not(save group to map component)
            group_name: name for the map group passed. If add_to_map = true, a group name for the map components must be provided
            restricted_airspace: vertices of the restricted airspace polygon
            altitude: altitude of flight path in m // default = 4000m
        '''
        D = Data()  # create graph for path
        source, target = source.upper(), target.upper()
        graph = D.create_graph(source, target, restricted_airspace=restricted_airspace, padding_restricted=4)

        # if airport is in restricted airspace -> return warning and dont find path
        if graph == "airport in restricted airspace":
            return graph
        
        path, distance, dis_dict = Path(graph).findPath(source, target)  # find shortest path 
        # path = path, distance = total distance of path, dis_dict = distance dictionary
        print("path created")

        fuel, time = Aircraft(aircraft_model).fueltime(distance, altitude, source, target)
        print("fuel time calculated")
        if add_to_map:
            self.add_plan_to_map_component(path=path, group_name=group_name, distance=distance, 
                                           fuel=fuel, time=time, altitude=altitude,
                                           restricted_airspace=restricted_airspace)

        return {"route":path, "distance": distance, "fuel":fuel, "time":time, 
                "restricted_airspace": restricted_airspace, "altitude": altitude}

    def add_plan_to_map_component(self, path: list, group_name: str, distance: int , 
                                  fuel:int, time: int, altitude: int, restricted_airspace: list=None):
        '''
        add a path and restricted polygon to 'mapComponents.json' so mapview.jsx can fetch and plot on map
        args:
            path: path list generated from path().findpath function
            group_name: name of the path group
            distance: total distance of path
            fuel: estimated fuel usage
            time: estimated time of flight
            altitude: altitude of flight
            restricted_airspace: vertices of the restricted airspace polygon
        '''
        '''
        json format
        {
            "name": groupname,
            "path": path,
            "labels": labels,
            "polygon": polygon,
            "distance": distance
            "fuel": fuel,
            "time": time,
            "altitude": altitude
        }
        '''
        path_coords = [[lat, lon] for sid, lat, lon in path]  # list of coordinates of the path
        labels = [sid for sid, lat, lon in path]  # label for each node in the path
        map_dict = {
            "name": group_name,
            "path": path_coords,
            "labels": labels,
            "polygon": restricted_airspace,
            "distance": distance,
            "fuel": fuel,
            "time": time,
            "altitude": altitude
        }
        try:  # write dict into json
            with open("mapComponents.json", "r") as f:
                d = load(f)
        except:
            d = []
        d.append(map_dict)
        obj = dumps(d, indent=4)
        with open("mapComponents.json", "w") as f:
            f.write(obj)


if __name__ == "__main__":

    # Test B9
    print("\nTerminal")
    B = Backend()  # call backend class
    yorkshire_polygon = [
    [54.6125, -2.2231], [54.4784, -1.6969], [54.3874, -1.3419], [54.2773, -0.6142], 
    [54.1363, -0.3009], [53.9630, -0.4313], 
    [53.7485, -0.3684], [53.6947, -1.0705], [53.6183, -1.3414], [53.5207, -1.5097], 
    [53.3831, -1.4669], [53.4376, -1.7480], 
    [53.6252, -1.9408], [53.8651, -1.9149], [54.0076, -2.1687], [54.1645, -2.4061], 
    [54.2892, -2.4526], [54.4031, -2.3476], 
    [54.6125, -2.2231]]
    x = B.create_plan(source="EGPB", target="EGKK", aircraft_model="FA-18E", 
                      restricted_airspace=yorkshire_polygon, add_to_map=True, group_name="AALL")
    print(x)
    
    # # check json
    # with open("mapComponents.json", "r") as f:
    #     x = load(f)

    # print(f"Item0: {x[0]}")
    # print(f"Item1: {x[1]}")

    # B.add_plan_to_map_component(path=[("EGLL", 12, 12), ("EGNM", 13, 13)], group_name="LLNM", distance=100, fuel=100,
    #                             time=1, altitude=100, restricted_airspace=None)
    
    
    # x = B.create_plan(source="EGLL", target="EGNM", aircraft_model=["FA-18E"], 
    #                   add_to_map=True, group_name="test", 
    #                   restricted_airspace=yorkshire_polygon)
    # print("\nTerminal")
    # print(x)
