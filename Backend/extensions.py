from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_restx import Api, reqparse

cors = CORS()
jwt = JWTManager()

authorizations = {"Bearer": {"type": "apiKey", "in": "header", "name": "Authorization"}}
api = Api(
    version="1.0",
    description="E-Athlia Backend API",
    authorizations=authorizations,
    security="Bearer",
)


class CustomParser(reqparse.RequestParser):
    class _Argument(reqparse.Argument):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)

            self.required = kwargs.get("required", True)
            self.location = kwargs.get("location", "json")
            self.trim = kwargs.get("trim", True)

    def __init__(self, *args, **kwargs):
        self.default_location = kwargs.pop("default_location", None)

        super().__init__(*args, **kwargs)
        self.argument_class = self._Argument

    def add_argument(self, *args, **kwargs):
        if self.default_location and isinstance(self.default_location, (str, list)):
            kwargs["location"] = self.default_location

        return super().add_argument(*args, **kwargs)
