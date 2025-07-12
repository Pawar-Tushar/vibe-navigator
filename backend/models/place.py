from pydantic import BaseModel, Field
from bson import ObjectId
from pydantic_core import core_schema
from typing import Optional, List, Dict,Any

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, _source_type: Any, _handler: Any
    ) -> core_schema.CoreSchema:

        def validate_from_str(v: str) -> ObjectId:
            if not ObjectId.is_valid(v):
                raise ValueError("Invalid ObjectId")
            return ObjectId(v)

        from_str_schema = core_schema.chain_schema(
            [
                core_schema.str_schema(),
                core_schema.no_info_plain_validator_function(validate_from_str),
            ]
        )

        return core_schema.json_or_python_schema(
            json_schema=from_str_schema,
            python_schema=core_schema.union_schema(
                [
                    core_schema.is_instance_schema(ObjectId),
                    from_str_schema,
                ]
            ),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )
    
class Coordinates(BaseModel):
    lat: float
    lon: float

class Review(BaseModel):
    text: str
    source: str
    author: Optional[str] = None

class AIAnalysis(BaseModel):
    vibe_summary: str
    vibe_tags: List[str]
    emojis: str

class Location(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    city: str
    category: str
    address: Optional[str] = None
    coordinates: Coordinates
    raw_reviews: List[Review] = []
    ai_analysis: Optional[AIAnalysis] = None 

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str} 

class ChatMessage(BaseModel):
    role: str 
    parts: str

class VibeAgentRequest(BaseModel):
    query: str
    city: str
    chat_history: Optional[List[ChatMessage]] = [] 

class SourceDocument(BaseModel):
    location_name: str
    review_text: str
    author: Optional[str]

class VibeAgentResponse(BaseModel):
    reply: str
    sources: List[SourceDocument] 

class TourPlannerRequest(BaseModel):
    city: str
    vibe_tags: List[str] = Field(..., min_items=1, max_items=10) 