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


@app.route("/user/recommendations", methods=["GET"])
def get_recommendations():
    user_id = request.args.get("user_id")
    try:
        user_object_id = ObjectId(user_id)  # Convert string to ObjectId
    except:
        return jsonify({"error": "Invalid user ID format"}), 400
    
    user_data = users_collection.find_one({"_id": user_object_id})
    if not user_data or "embedding" not in user_data:
        return jsonify({"error": "User embedding not found"}), 404
    
    user_embedding = np.array(user_data["embedding"]).astype(np.float32)

    # Search FAISS for the top 5 most similar videos
    video_distances, video_indices = video_index.search(np.array([user_embedding]), 5)
    user_distances, user_indices = user_index.search(np.array([user_embedding]), 5)
    
    print("FAISS video search indices:", video_indices)
    print("FAISS video similarity scores:", video_distances)
    print("FAISS user search indices:", user_indices)
    print("FAISS user similarity scores:", user_distances)

    recommended_videos = []
    recommended_users = []
    video_ids = list(videos_collection.find({}, {"_id": 1}))  # Retrieve all video IDs in order
    user_ids = list(users_collection.find({}, {"_id": 1}))  # Retrieve all user IDs in order

    for idx, distance in zip(video_indices[0], video_distances[0]):
        if idx != -1 and idx < len(video_ids):  # Ensure index is valid
            video_object_id = video_ids[idx]["_id"]
            video = videos_collection.find_one({"_id": video_object_id})
            if video:
                video["_id"] = str(video["_id"])
                video["similarity_score"] = float(distance)  # Lower score = more similar
                print("Recommending video:", video["_id"], "with similarity score:", video["similarity_score"])
                recommended_videos.append(video)
    
    for idx, distance in zip(user_indices[0], user_distances[0]):
        if idx != -1 and idx < len(user_ids):  # Ensure index is valid
            user_object_id = user_ids[idx]["_id"]
            if user_object_id == user_data["_id"]:  # Skip the user himself
                continue
            similar_user = users_collection.find_one({"_id": user_object_id})
            if similar_user:
                similar_user["_id"] = str(similar_user["_id"])
                similar_user["similarity_score"] = float(distance)  # Lower score = more similar
                recommended_users.append(similar_user)


    # Sort users by similarity score (FAISS returns L2 distance, lower is better)
    recommended_users.sort(key=lambda x: x["similarity_score"])

    liked_videos_by_recommended_users = []
    videos_from_recommended_users_over_5 = False
    for user in recommended_users:
        print("Checking user:", user["username"], "with similarity score:", user["similarity_score"])
        if videos_from_recommended_users_over_5:
            break
        liked_interactions_by_recommended_user = list(interactions_collection.find(
            {
                "userId": str(user["_id"]),
                "type": "like"
            }
        ))
        print("Liked interactions:", liked_interactions_by_recommended_user)
        for interaction in liked_interactions_by_recommended_user:
            if len(liked_interactions_by_recommended_user) >= 5:
                videos_from_recommended_users_over_5 = True
                break

            video = videos_collection.find_one({"_id": ObjectId(interaction["videoId"])})
            if video:
                video["_id"] = str(video["_id"])
                video["similarity_score"] = float(user["similarity_score"])
                if video["_id"] not in [video["_id"] for video in recommended_videos]: # Prevent duplicates
                    print("Recommending video:", interaction["videoId"], "from recommended user:", user["_id"])
                    liked_videos_by_recommended_users.append(video)
                # Log data usage for reccomendation for similar user
                print("Logging data usage for recommendation for similar user: ", user["_id"])
                response = requests.post(os.getenv("BACKEND_URL") + "/data-usage/recommendation", json={
                    "walletAddress": user["walletId"]
                })

    recommended_videos.extend(liked_videos_by_recommended_users)

    """
    # Remove videos that have already been watched by user (REMOVED FOR TESTING PURPOSES)
    watched_videos_by_user = list(interactions_collection.find(
        {
            "userId": str(user_id),
            "type": "watch"
        },
        {"videoId": 1, "_id": 0}
    ))
    recommended_videos = [video for video in recommended_videos if video["_id"] not in [interaction["videoId"] for interaction in watched_videos_by_user]]
    """

    recommended_videos.sort(key=lambda x: x["similarity_score"])

    return jsonify({
        "recommended_videos": recommended_videos
    })


@app.route("/user/delete", methods=["DELETE"])
def delete_user():
    user_id = request.args.get("user_id")
    try:
        user_object_id = ObjectId(user_id)
    except:
        return jsonify({"error": "Invalid user ID format"}), 400
    users_collection.delete_one({"_id": user_object_id})
    load_faiss_indices()
    return jsonify({"message": "User deleted successfully"})

@app.route("/video/delete", methods=["DELETE"])
def delete_video():
    video_id = request.args.get("video_id")
    try:
        video_object_id = ObjectId(video_id)
    except:
        return jsonify({"error": "Invalid video ID format"}), 400
    videos_collection.delete_one({"_id": video_object_id})
    load_faiss_indices()
    return jsonify({"message": "Video deleted successfully"})

@app.route("/user/get_all_users", methods=["GET"])
def get_all_users():
    users = users_collection.find()
    user_list = []
    for user in users:
        user["_id"] = str(user["_id"])  # Convert ObjectId to string
        user_list.append(user)
    return jsonify({"users": user_list})

@app.route("/user/get_all_videos", methods=["GET"])
def get_all_videos():
    videos = videos_collection.find()
    video_list = []
    for video in videos:
        video["_id"] = str(video["_id"])  # Convert ObjectId to string
        video_list.append(video)
    return jsonify({"videos": video_list})

@app.route("/interactions/recent-views/<user_id>", methods=["GET"])
def get_recent_viewed_videos(user_id):
    """Get last 5 video IDs viewed by a user"""
    try:
        # Validate user_id is a non-empty string
        if not isinstance(user_id, str) or not user_id.strip():
            raise ValueError
    except:
        return jsonify({"error": "Invalid user ID format"}), 400
    
    # Query as STRING (not ObjectId)
    recent_views = list(interactions_collection.find(
        {
            "userId": user_id,  # Match string-to-string
            "type": "watch"
        },
        {"videoId": 1, "createdAt": 1, "_id": 0}
    ).sort("createdAt", -1).limit(5))  # Works if createdAt is ISO date
    
    video_ids = [str(view["videoId"]) for view in recent_views]
    
    return jsonify({
        "user_id": user_id,
        "recent_viewed_videos": video_ids,
        "count": len(video_ids)
    })

@app.route("/calculate-rewards", methods=["POST"])
def calculate_rewards():
    print("Reward calculation started")

    data = request.json

    print("Data:", data)
    
    # Validate input
    if not all(key in data for key in ["merchantType", "merchantLocation", "purchasingUserAddress", "transactionTitle"]):
        return jsonify({"error": "merchantType, merchantLocation, transactionTitle and recentWatchedVideos are required"}), 400
    
    user_address = data['purchasingUserAddress']

    user_address_lower = user_address.lower()
    user_id = users_collection.find_one({"walletId": user_address_lower})["_id"]

    # Fetch watched videos from the database
    watched_videos_interactions = list(interactions_collection.find(
        {
            "userId": str(user_id),  # Match string-to-string
            "type": "watch"
        },
    ).sort("createdAt", -1).limit(5))  # Works if createdAt is ISO date

    watched_videos = []
    for interaction in watched_videos_interactions:
        video_id = interaction["videoId"]
        video = videos_collection.find_one({"_id": ObjectId(video_id)})
        if video:
            video["_id"] = str(video["_id"])
            watched_videos.append(video)

    # Create merchant embedding
    merchant_text = f"{data['merchantType']} {data['merchantLocation']} {data['transactionTitle']}"
    merchant_embedding = embedding_model.encode(merchant_text).astype(np.float32)
    

    # No rewards distribution needed
    if not watched_videos:
        return jsonify({
            "msg": "No rewards distribution required due to no watched videos"
        })
    
    
    # Calculate relevance scores for each video
    influence_scores = {}
    for video in watched_videos:
        if not video["posterId"]:
            continue
            
        # Calculate cosine similarity between merchant and video
        video_embedding = video["embedding"]
        similarity = np.dot(merchant_embedding, video_embedding) / (
            np.linalg.norm(merchant_embedding) * np.linalg.norm(video_embedding)
        )
        
        # Add to influence scores (accumulate if same poster)
        if video["posterId"] in influence_scores:
            influence_scores[video["posterId"]] += similarity
        else:
            influence_scores[video["posterId"]] = similarity
    
    # Normalize influence scores to sum up to 100
    total_score = sum(influence_scores.values())
    if total_score > 0:
        for poster_id in influence_scores:
            influence_scores[poster_id] = (influence_scores[poster_id] / total_score) * 100
    
    # Get wallet addresses for users
    results = []
    for poster_id, score in influence_scores.items():
        try:
            user = users_collection.find_one({"_id": ObjectId(poster_id)})
            if user and "walletId" in user:
                results.append({
                    "influenceScore": float(score),
                    "walletAddress": user["walletId"]
                })
        except:
            continue
    
    # Sort by influence score in descending order
    results.sort(key=lambda x: x["influenceScore"], reverse=True)
    print("Results:", results)
    return jsonify({
        "users": results
    })

@app.route("/get_all_interactions", methods=["GET"])
def get_all_interactions():
    interactions = interactions_collection.find()
    interaction_list = []
    for interaction in interactions:
        interaction["_id"] = str(interaction["_id"])
        interaction_list.append(interaction)
    return jsonify({"interactions": interaction_list})


if __name__ == "__main__":
    load_faiss_indices()  # Ensure FAISS loads embeddings on startup
    app.run(debug=True, port=5001)