// MongoDB initialization script
db = db.getSiblingDB('quiz-app');

// Create collections with validation
db.createCollection('games', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "description", "status"],
      properties: {
        title: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        description: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        status: {
          bsonType: "string",
          enum: ["not-started", "live", "finished"],
          description: "must be one of the allowed values"
        }
      }
    }
  }
});

// Create indexes for better performance
db.games.createIndex({ "status": 1 });
db.games.createIndex({ "createdAt": -1 });

// Create teams collection with unique constraint
db.createCollection('teams');
db.teams.createIndex({ "gameId": 1, "teamNumber": 1 }, { unique: true });

// Create questions collection with indexes
db.createCollection('questions');
db.questions.createIndex({ "gameId": 1 });
db.questions.createIndex({ "movieId": 1, "level": 1 });
db.questions.createIndex({ "opened": 1 });

print('Database initialized successfully!');

