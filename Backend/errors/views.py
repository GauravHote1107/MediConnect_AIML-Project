from flask import Blueprint, Response
from werkzeug.exceptions import HTTPException

blueprint = Blueprint("error_handler", __name__)


@blueprint.route("/")
def index():
    return Response("MediConnect v1.0.0", mimetype="text/plain")


@blueprint.app_errorhandler(HTTPException)
def handle_error(e):
    return {"error": e.description, "status": e.code}
