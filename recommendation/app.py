import faiss
import numpy as np
import json
from flask import Flask, request, jsonify
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from bson import ObjectId  # Added import for ObjectId
from flask_cors import CORS  # Install with: pip install flask-cors
from dotenv import load_dotenv
import requests
import os

load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load embedding model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Initialize MongoDB client
client = MongoClient("mongodb://localhost:27017/")
db = client["recommendation_db"]
users_collection = db["users"]
videos_collection = db["videos"]

db_test = client["test"]  # Matches Express default
interactions_collection = db_test["interactions"]

# Initialize FAISS index for 384-d embeddings
embedding_dim = 384  # Model output dimension
video_index = faiss.IndexFlatL2(embedding_dim)
user_index = faiss.IndexFlatL2(embedding_dim)

def load_faiss_indices():
    global video_index, user_index
    video_embeddings = []
    user_embeddings = []
    
    # Load embeddings with validation
    for video in videos_collection.find({}, {"embedding": 1}):
        if "embedding" in video:
            emb = np.array(video["embedding"], dtype=np.float32)
            if len(emb) != embedding_dim:
                print(f"Warning: Video embedding has wrong dimension ({len(emb)}), skipping")
                continue
            video_embeddings.append(emb)
    
    for user in users_collection.find({}, {"embedding": 1}):
        if "embedding" in user:
            emb = np.array(user["embedding"], dtype=np.float32)
            if len(emb) != embedding_dim:
                print(f"Warning: User embedding has wrong dimension ({len(emb)}), skipping")
                continue
            user_embeddings.append(emb)
    
    # Rebuild indices
    if video_embeddings:
        video_embeddings_array = np.vstack(video_embeddings)
        video_index = faiss.IndexFlatL2(embedding_dim)
        video_index.add(video_embeddings_array)
    
    if user_embeddings:
        user_embeddings_array = np.vstack(user_embeddings)
        user_index = faiss.IndexFlatL2(embedding_dim)
        user_index.add(user_embeddings_array)
    
    print(f"Loaded {len(video_embeddings)} video embeddings")
    print(f"Loaded {len(user_embeddings)} user embeddings")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({ "status": "ok" })


@app.route("/video/init", methods=["POST"])
def init_video():
    data = request.json
    if "posterId" not in data:
        return jsonify({"error": "posterId is required"}), 400
    text_data = f"{data['caption']} {data['hashtags']} {data['location']}"
    embedding = embedding_model.encode(text_data).astype(np.float32).tolist()
    data["embedding"] = embedding
    video_id = videos_collection.insert_one(data).inserted_id
    load_faiss_indices()  # Reload FAISS after inserting
    return jsonify({"video_id": str(video_id), "message": "Video embedding stored"})

@app.route("/user/init", methods=["POST"])
def init_user():
    data = request.json
    if "walletId" not in data:
        return jsonify({"error": "walletId is required"}), 400
    text_data = f"{data['age']} years old, living in {data['location']}"
    embedding = embedding_model.encode(text_data).astype(np.float32).tolist()
    data["embedding"] = embedding
    user_id = users_collection.insert_one(data).inserted_id
    load_faiss_indices()  # Reload FAISS after inserting
    return jsonify({"user_id": str(user_id), "message": "User embedding stored"})