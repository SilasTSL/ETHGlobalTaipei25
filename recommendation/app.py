from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    return jsonify({
        'message': 'Recommendation system is running',
        'status': 'operational',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 