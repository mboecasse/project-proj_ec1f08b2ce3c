.
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── README.md                # This file
├── jest.config.js           # Jest testing configuration
├── package.json             # Project dependencies and scripts
├── src/
│   ├── app.js              # Express application setup
│   ├── server.js           # HTTP server initialization and startup
│   ├── config/
│   │   ├── database.js     # MongoDB connection configuration
│   │   └── env.js          # Environment variable validation
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic (register, login)
│   │   └── postController.js    # Post CRUD business logic
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication middleware
│   │   ├── errorHandler.js # Global error handling middleware
│   │   ├── rateLimiter.js  # Rate limiting configuration
│   │   ├── security.js     # Security headers (Helmet, CORS)
│   │   └── validator.js    # Request validation middleware
│   ├── models/
│   │   └── Post.js         # Mongoose Post schema and model
│   ├── routes/
│   │   ├── authRoutes.js   # Authentication endpoints
│   │   ├── healthRoutes.js # Health check endpoints
│   │   ├── index.js        # Route aggregator
│   │   └── postRoutes.js   # Post CRUD endpoints
│   ├── utils/
│   │   ├── apiResponse.js  # Standardized API response formatter
│   │   ├── logger.js       # Winston logger configuration
│   │   └── postValidator.js # Post-specific validation rules
│   └── tests/
│       ├── setup.js        # Jest test environment setup
│       ├── unit/
│       │   └── postController.test.js  # Unit tests for post controller
│       └── integration/
│           └── postRoutes.test.js      # Integration tests for API endpoints
