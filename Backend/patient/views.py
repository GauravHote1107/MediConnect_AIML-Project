import random
from dataclasses import dataclass
from typing import Dict

from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from flask_restx import Resource
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from patient.ocr import perform_ocr
from werkzeug.datastructures import FileStorage

from extensions import CustomParser

from . import ns
from .serializer import patient_otp_model


@dataclass()
class UserData:
    name: str
    picture: str

    files: InMemoryVectorStore = InMemoryVectorStore(
        OllamaEmbeddings(model="nomic-embed-text:latest")
    )


otp_mapping: Dict[int, str] = {}
data_mapping: Dict[str, UserData] = {}


@ns.route("/generate-otp")
class GenerateOTPRoute(Resource):
    _generate_otp_parser = CustomParser()
    _generate_otp_parser.add_argument("name", type=str)
    _generate_otp_parser.add_argument("email", type=str)
    _generate_otp_parser.add_argument("picture", type=str)

    @ns.expect(_generate_otp_parser)
    @ns.marshal_with(patient_otp_model)
    def post(self):
        args = self._generate_otp_parser.parse_args(strict=True)
        otp = random.randint(100000, 999999)

        name = args.get("name")
        email = args.get("email")
        picture = args.get("picture")

        user_data = UserData(name, picture)

        otp_mapping[otp] = email
        data_mapping[email] = user_data

        return {"otp": otp, "access_token": create_access_token(email)}


@ns.route("/upload")
class UploadRoute(Resource):
    _upload_parser = CustomParser()
    _upload_parser.add_argument("file", type=FileStorage, location="files")

    @ns.expect(_upload_parser)
    @jwt_required()
    def post(self):
        email = get_jwt_identity()
        args = self._upload_parser.parse_args(strict=True)
        file: FileStorage = args.get("file")

        if file.content_type == "image/jpeg" or file.content_type == "image/png":
            text = perform_ocr(file.stream.read())
        elif file.content_type == "text/plain":
            text = perform_ocr(file.stream.read())
        else:
            return ns.abort(400, "Error: File type not supported.")

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        all_splits = text_splitter.split_text(text)

        data_mapping[email].files.add_texts(all_splits)

        return "Done uploading file"
