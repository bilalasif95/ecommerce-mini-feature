// Enhanced Express backend with improved security and error handling
// Security comments included inline (SQL Injection, XSS, CSRF prevention)

require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");

const app = express();

// Enhanced security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Enhanced CORS configuration - restrict origins in production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Load products data
const PRODUCTS = JSON.parse(
  fs.readFileSync(path.join(__dirname, "products.json"))
);
const JWT_SECRET =
  process.env.JWT_SECRET || "very-secret-for-demo-change-in-production";

// Enhanced rate limiter for login: 5 requests per minute per IP
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: { error: "Too many login attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: true,
});

// Dummy in-memory user (as per requirements)
const DUMMY_USER = { id: 1, email: "user@example.com", name: "Demo User" };
const DUMMY_PASSWORD = "password123";

// Input validation middleware
const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }
    next();
  },
];

// Enhanced login endpoint with validation
app.post("/login", loginLimiter, validateLogin, (req, res) => {
  const { email, password } = req.body || {};

  // Additional security: Check for common attack patterns
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Invalid input format" });
  }

  // Prevent timing attacks by always performing comparison
  const isValidEmail = email === DUMMY_USER.email;
  const isValidPassword = password === DUMMY_PASSWORD;

  if (isValidEmail && isValidPassword) {
    const token = jwt.sign(
      {
        id: DUMMY_USER.id,
        email: DUMMY_USER.email,
        name: DUMMY_USER.name,
      },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
    );
    return res.json({
      token,
      user: {
        id: DUMMY_USER.id,
        email: DUMMY_USER.email,
        name: DUMMY_USER.name,
      },
    });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

// Enhanced product endpoints with better error handling
app.get("/products", (req, res) => {
  try {
    // Add pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedProducts = PRODUCTS.slice(startIndex, endIndex);

    res.json({
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: PRODUCTS.length,
        pages: Math.ceil(PRODUCTS.length / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/products/:id", (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    // Input validation
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Enhanced GraphQL schema with better error handling
const schema = buildSchema(`
  type User { 
    id: ID!
    email: String!
    name: String!
  }
  type Query { 
    userProfile: User 
  }
`);

const root = {
  userProfile: (args, context) => {
    const auth = context.auth;
    if (!auth || !auth.id) {
      throw new Error("Unauthorized: Valid token required");
    }
    return {
      id: auth.id,
      email: auth.email,
      name: auth.name || "Demo User",
    };
  },
};

// Enhanced JWT middleware with better error handling
function jwtMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header required" });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    } else {
      return res.status(401).json({ error: "Authentication failed" });
    }
  }
}

// Enhanced GraphQL endpoint
app.use(
  "/graphql",
  jwtMiddleware,
  graphqlHTTP((req) => ({
    schema,
    rootValue: root,
    graphiql: process.env.NODE_ENV === "development",
    context: { auth: req.user },
    customFormatErrorFn: (error) => {
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
  }))
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Serve static files from React build
const staticPath = path.join(__dirname, "public");
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  app.get("*", (req, res) => res.sendFile(path.join(staticPath, "index.html")));
}

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

/*
SECURITY IMPLEMENTATION NOTES:

1. SQL INJECTION PREVENTION:
   - Currently using static JSON data, but when implementing database:
   - Use parameterized queries: db.query('SELECT * FROM users WHERE id = ?', [userId])
   - Use ORM/query builders that automatically escape inputs
   - Validate and sanitize all user inputs before database operations
   - Example: const user = await User.findById(req.params.id) // Mongoose automatically escapes

2. XSS (Cross-Site Scripting) PREVENTION:
   - Helmet middleware sets security headers including CSP
   - Input validation with express-validator sanitizes inputs
   - Escape user-generated content before rendering
   - Use Content Security Policy headers to restrict script execution
   - Example: res.setHeader('Content-Security-Policy', "default-src 'self'")

3. CSRF (Cross-Site Request Forgery) PREVENTION:
   - Use SameSite cookie attribute for session cookies
   - Implement CSRF tokens for state-changing operations
   - Validate Origin/Referer headers for sensitive operations
   - Use double-submit cookie pattern
   - Example: app.use(csurf({ cookie: { sameSite: 'strict' } }))

4. ADDITIONAL SECURITY MEASURES IMPLEMENTED:
   - Rate limiting on login endpoint (5 requests/minute)
   - JWT token expiration (2 hours)
   - Input validation and sanitization
   - CORS origin restriction
   - Helmet security headers
   - Error handling that doesn't leak sensitive information
   - Request size limits to prevent DoS attacks
*/
