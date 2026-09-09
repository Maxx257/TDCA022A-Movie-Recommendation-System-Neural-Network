from fastapi import FastAPI
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.database import engine
from app.api.auth import router as auth_router


app = FastAPI(
    title="Movie Recommendation System API",
    description="Backend API for the neural network based movie recommendation system.",
    version="0.1.0",
)

app.include_router(auth_router)

@app.get("/")
def root():
    return {
        "message": "Movie Recommendation System API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/health/db")
def database_health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except SQLAlchemyError:
        return {
            "status": "unhealthy",
            "database": "disconnected"
        }