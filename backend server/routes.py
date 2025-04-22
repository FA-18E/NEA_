## routes.py
from app import app
from flask import jsonify, Blueprint, request
from database import Database
from collections import OrderedDict
from backend import Backend
from json import load, dumps

# Create a Blueprint (like a mini Flask app)
routes = Blueprint("routes", __name__)

def map_fields(raw_data:list, table:str)->list:
    '''
        maps fields to data item and insert them into a json
        args:
            raw_data: fresh/raw data selected from database select query
            table: table name
    '''
    fields_data = Database().select_query(f"PRAGMA table_info({table})")  # get table fields
    # since fields_data contains all data about a field(type, length, etc) 
    # so a for loop is used to select the actual field names out
    fields = [item[1] for item in fields_data]  
    data_dict = []  # list(dict/json) that will be returned

    for record in raw_data:
        # map each field to the corresponding item in the selected record
        data_dict.append(OrderedDict(zip(fields, record)))  
    return data_dict

def get_primary_key(table: str):
    '''
        get the name of the field for primary key for a table
        args:
            table: table name
        return primary key name
    '''
    # get primary key field name for table
    fields = Database().select_query(f"PRAGMA table_info({table})")
    return fields[0][1]  # return name


@routes.route("/database/<table>", methods=["GET"])
def get_db_data(table):
    DB = Database()
    data = DB.select_query(f"SELECT * FROM {table}")  # get data
    data_dict = map_fields(data, table)

    return (data_dict), 200  # jsonify the dict js in case

@routes.route("/database/search/<table>/<field>/<search_item>", methods=["GET"])
def search_in_table(table, field, search_item):
    # select query
    query = f'''SELECT * FROM {table} WHERE {table}.{field} LIKE '{search_item}%' '''

    data = Database().select_query(query)  # execute query and fetch data
    data_dict = map_fields(data, table)  # map records to their fields

    return jsonify(data_dict), 200


@routes.route("/database/update/<table>/<id_>", methods=["PATCH"])
def update_data_items(table: str, id_: any):
    '''
        update data in database
        args:
            table: table name
            id_: primary key of the record(id of record)
    '''
    data = request.json
    set_clause = ""
    primary_key=""
    for item in data:
        set_clause += f"{item}='{data[item]}',"

    primary_key = get_primary_key(table)
    set_clause = set_clause[:-1]  # remove the last item(,)
    if type(id_) != int:
        query = f'''UPDATE {table} SET {set_clause} WHERE {primary_key}='{id_}' '''
    else:
        query = f'''UPDATE {table} SET {set_clause} WHERE {primary_key}={id_}'''
    # print(query)
    try:
        x = Database().execute(query)  # if ok
    except Exception as e:
        return jsonify(e), 500  # return error
    return jsonify(x), 200  # return ok

@routes.route("/database/delete/<table>/<id_>", methods=["DELETE"])
def delete_item(table: str, id_: any):
    '''
        delete item from database table
        args:
            table: table name
            id_: primary key of the record(id of record)
    '''
    primary_key = get_primary_key(table)  # get primary key name for the table

    if type(id_) != int:  # if id type is not int
        query = f'''DELETE FROM {table} WHERE {primary_key}='{id_}' '''
    else:  # is int
        query = f'''DELETE FROM {table} WHERE {primary_key}={id_}'''
    try:
        x = Database().execute(query)  # if ok
    except Exception as e:
        return jsonify(e), 500  # return error
    return jsonify(x), 200  # return ok

@routes.route("/database/add/<table>", methods=["POST"])
def add_data(table):
    try:
        data = request.json
        print(data)
        items_to_add = ""
        for item in data:
            if type(item) != int:  
                # type of data is not int -> add quote marks
                items_to_add += f"'{data[item]}',"
            else:  # is int -> add quote marks
                items_to_add += f"{data[item]},"
        items_to_add = items_to_add[:-1] # remove the last item(,)

        query = f"INSERT INTO {table} VALUES ({items_to_add})"
        x = Database().execute(query)
        print(query)
        return jsonify("add new"), 201
    except Exception as e:
        return jsonify({"ERROR": e}), 500

@routes.route("/createPlan", methods=["POST"])
def create_plan():
    try:
        data = request.json  # request data from api
        source = data["source"]
        target = data["target"]
        aircraft_model = data["aircraft"][0]
        add_to_map = data["addToMap"]
        group_name = data["groupName"]
        restricted_airspace = data["restrictedAirspace"]
        if len(restricted_airspace) == 0:
            restricted_airspace=None
        try:  # try change the type from string to int 
            altitude = int(data["altitude"])
        except Exception as e:
            return jsonify({"Error": e}), 500  # return not ok
        print(restricted_airspace)
        # gen path, fuel and time
        path_data = Backend().create_plan(source, target, add_to_map=add_to_map, 
                                          group_name=group_name, restricted_airspace=restricted_airspace, 
                                          aircraft_model=aircraft_model, altitude=altitude)
    except Exception as e:
        return jsonify({"Error": e}), 500
    return jsonify(path_data), 201
    

@routes.route("/fetchAircrafts", methods=["GET"])
def fetch_aircrafts():
    try:
        # get aircraft id (model of aircraft) from database
        data = Database().select_query("SELECT AircraftID FROM Aircraft")
    except Exception as e:
        # return error if error
        return jsonify({"error": e})
    data = [record[0] for record in data]  # map id into a list
    # return names for aircraft if no error
    return jsonify(data), 200

@routes.route("/mapComponents/get", methods=["GET"])
def get_components():
    with open("mapComponents.json", "r") as f:
        d = load(f)  # load json
    return jsonify(d), 200  # return json 

@routes.route("/mapComponents/delete/<int:index>", methods=["DELETE"])
def delete_component(index):
    '''
    args:
        index: index of item to be deleted in list
    '''
    try:
        # load paths stored in json
        with open("mapComponents.json", "r") as f:
            d = load(f)
    except Exception as e:
        #  return error if error
        return jsonify({"error": e}), 500
    
    if d !={}:  # if there are paths stored in the json
        d.pop(index)  # pop the path to be deleted
        obj = dumps(d, indent=4)  # save the new json into a json object
        with open("mapComponents.json", "w") as f:
            f.write(obj)  # write the new json into the file
        return jsonify("deleted"), 200  # ok res
    else:
        # otherwise return an error that the json is empty
        # (no paths to delete)
        return jsonify("Empty json"), 500

if __name__ == "__main__":
    pass    
    
    # Test API5
    print("\nTerminal")
    DB = Database()
    x = DB.select_query('''SELECT * FROM Coordinates WHERE Country="AU" ''')     
    print(f"Returned values:{x}")   
