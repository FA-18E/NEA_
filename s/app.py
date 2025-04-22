## app.py
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# load env settings
load_dotenv(".env")

app = Flask(__name__)
CORS(app)

if __name__ == "__main__":
    # import api routes
    from routes import routes
    app.register_blueprint(routes)
    app.run(debug=True, port=8080)

