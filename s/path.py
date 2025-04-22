## path.py
from heapq import heapify, heappop, heappush  # python priority queue
from os.path import dirname, abspath
from json import load
from database import Database
from data import Data
from geopy.distance import geodesic

class Path:

    def __init__(self, graph: dict):
        '''
            args:
                graph: {weighted adjacency list}, {coordinates of each node}
        '''
        self.graph_graph = graph["graph"]
        self.graph_coord = graph["coords"]

    def dijkstras(self, source: str) -> tuple:
        '''
            dijkstras algorithm using a weighted adjacency list
            args:
                source: start node
                graph: weighted adjacency list
            return: {distance from source node to all other nodes on graph}, 
                    {immediate predecessors of all nodes}
        '''
        graph = self.graph_graph

        # Initialize the values of all nodes with infinity
        distances = {node: float("inf") for node in graph}
        distances[source] = 0  # Set the source value to 0

        # Initialize a priority queue
        priority = [(0, source)]
        heapify(priority)  # turns list of tuples with values into a priority list
        # priority max 0-inf min
 
        visited = set()  # set to hold visited nodes

        while priority:  # while priority queue not empty
            current_distance, current_node = heappop(priority)  # pop element with highest priority
            # print(current_node)
            if current_node in visited:  # if node already visited 
                continue  # next loop

            visited.add(current_node)

            for neighbour, weight in graph[current_node].items():

                # Calculate the distance from current_node to the neighbour
                tentative_distance = current_distance + weight
                if tentative_distance < distances[neighbour]:
                    distances[neighbour] = tentative_distance
                    heappush(priority, (tentative_distance, neighbour))
        
        # predecessor graph for routing path
        predecessors = {node: None for node in graph}

        for node, distance in distances.items():
            for neighbour, weight in graph[node].items():
                if distances[neighbour] == distance + weight:
                    predecessors[neighbour] = node
        return distances, predecessors

    
    def findPath(self, source: str, target: str) -> tuple:
        '''
            find the path from a source node to a target on a weighted adjacency list 
            args:
                source: start node
                target: target node/ end node / destination node
                graph: {weighted adjacency list}, {coordinates of each node}
            return: list of nodes that the route uses, distance from source to target in km, dict distances from source node to all other nodes
            return: [(node secondary id, unique id, lat, lon), ....], int distance, [{secondary id: distance to source, ....}] 
        '''

        # Generate the predecessors dict
        graph_coords = self.graph_coord
        distances, predecessors = self.dijkstras(source)

        path = []  # path list -> stores all nodes in the path in order
        current_node = target  # let current node = target
        
        # Backtrack from the target node using predecessors
        while current_node:
            path.append(current_node)
            current_node = predecessors[current_node]

        # Reverse the path and return it
        path.reverse()
        output_path = []
        for node in path:  # get lat lon of each node in the path.
            lat, lon = graph_coords[node]["lat"], graph_coords[node]["lon"]
            item = (node, lat, lon)
            output_path.append(item)
        # distance from source to target
        distance_to_target = distances[target]
        return (output_path, distance_to_target, distances)


if __name__ == "__main__":
    D = Data()
    
    # Test P2
    graph = {
        "graph":{
            "A": {"B": 4, "C": 2},
            "B": {"A": 4, "C": 1, "D": 5},
            "C": {"A": 2, "B": 1, "D": 8, "E": 10},
            "D": {"B": 5, "C": 8, "E": 2, "Z": 6},
            "E": {"C": 10, "D": 2, "Z": 3},
            "Z": {"D": 6, "E": 3}
        }
        ,
        "coords":{
                "A": {"lat": 51.5074, "lon": -0.1278},
                "B": {"lat": 51.5155, "lon": -0.1020},
                "C": {"lat": 51.5230, "lon": -0.0871},
                "D": {"lat": 51.5312, "lon": -0.0715},
                "E": {"lat": 51.5380, "lon": -0.0502},
                "Z": {"lat": 51.5458, "lon": -0.0303}
            }
    }

    P = Path(graph=graph)
    path, dis, _ = P.findPath(source="A", target="Z")
    print("\nTerminal")
    path = "".join([node for node, lat, lon in path])  # remove coord from path list
    print(f"Path: {path}")
    print(f"Distance: {dis}")
