from fastapi import FastAPI


app = FastAPI(
    title="Movie Recommendation System API",
    description="Backend API for the neural network based movie recommendation system.",
    version="0.1.0",
)


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