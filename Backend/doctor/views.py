from typing import List, TypedDict

from flask_restx import Resource
from langchain import hub
from langchain.chat_models import init_chat_model
from langgraph.graph import START, StateGraph
from flask_jwt_extended import get_jwt_identity, create_access_token, jwt_required
from extensions import CustomParser
from doctor.serializer import patient_details_model
from patient.views import data_mapping, otp_mapping

from . import ns

llm = init_chat_model("llama-3.1-8b-instant", model_provider="groq")
prompt = hub.pull("rlm/rag-prompt")


class State(TypedDict):
    question: str
    context: List[str]
    answer: str


@ns.route("/ask")
class AskRoute(Resource):
    _ask_parser = CustomParser()
    _ask_parser.add_argument("question", type=str)

    @ns.expect(_ask_parser)
    @jwt_required()
    def post(self):
        email = get_jwt_identity()
        args = self._ask_parser.parse_args(strict=True)
        question = args.get("question")

        store = data_mapping[email].files

        def retrieve(state: State):
            retrieved_docs = store.similarity_search(state["question"])
            return {"context": retrieved_docs}

        def generate(state: State):
            docs_content = "\n\n".join(doc.page_content for doc in state["context"])
            messages = prompt.invoke({"question": state["question"], "context": docs_content})
            response = llm.invoke(messages)
            return {"answer": response.content}

        graph_builder = StateGraph(State).add_sequence([retrieve, generate])
        graph_builder.add_edge(START, "retrieve")
        graph = graph_builder.compile()

        return {"answer": graph.invoke({"question": question})["answer"]}


@ns.route("/patient-details")
class PatientDetailsRoute(Resource):
    
    @ns.marshal_with(patient_details_model)
    @jwt_required()
    def post(self):
        email = get_jwt_identity()
        user_details = data_mapping[email]

        return user_details


@ns.route("/verify-otp")
class VerifyOtpRoute(Resource):
    _verify_otp_parser = CustomParser()
    _verify_otp_parser.add_argument("otp", type=int)

    @ns.expect(_verify_otp_parser)
    def post(self):
        args = self._verify_otp_parser.parse_args(strict=True)
        otp = args.get("otp")

        if otp not in otp_mapping:
            return ns.abort(400, "Error: Invalid OTP entered.")

        email = otp_mapping.pop(otp)
        access_token = create_access_token(email)

        return {"access_token": access_token}
