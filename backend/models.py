from pydantic import BaseModel

class RegisterRequest(BaseModel):
    user_id: str
    email: str
    password: str

class LoginRequest(BaseModel):
    user_id: str
    password: str

class SwipeRequest(BaseModel):
    movie_id: int
    action: str
