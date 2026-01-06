from dotenv import load_dotenv
from flask import Blueprint, Flask

import errors
import patient
import doctor
from extensions import api, cors, jwt
from settings import Config


def create_app(*args, **kwargs):
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(obj=Config)
    app.url_map.strict_slashes = False

    register_extensions(app)
    register_blueprints(app)

    return app


def register_extensions(app: Flask):
    cors.init_app(app)
    jwt.init_app(app)


def register_blueprints(app: Flask):
    origins = app.config.get("CORS_ORIGIN_WHITELIST")
    if not origins:
        raise ValueError(
            "Error: 'CORS_ORIGIN_WHITELIST' variable doesn't exist within configuration."
        )

    cors.init_app(app, origins=origins)

    api.add_namespace(patient.ns)
    api.add_namespace(doctor.ns)

    blueprint = Blueprint("api", __name__, url_prefix="/api/v1")

    api.init_app(blueprint)
    app.register_blueprint(blueprint)
    app.register_blueprint(errors.views.blueprint)
