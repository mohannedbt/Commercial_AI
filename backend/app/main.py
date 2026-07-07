from fastapi import FastAPI
from app.api.router import generation
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import sys
import asyncio
import os
# Add this block at the top of your file
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
base_path = os.path.abspath(os.getcwd())
data_path = os.path.join(base_path, "data")
app = FastAPI()
# This must come BEFORE app.include_router
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], # Ensure OPTIONS is here
    allow_headers=["Content-Type", "Authorization"], # Ensure Content-Type is here
)
app.mount("/data", StaticFiles(directory=data_path), name="data")
app.mount("/temp_ads", StaticFiles(directory="temp_ads"), name="temp_ads")
app.include_router(generation)






@app.get("/")
async def root():
    return {"message": "Welcome to the Social Media Post Generator API"}

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="localhost", port=8000)