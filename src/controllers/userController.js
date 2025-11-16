const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getSessionType, SESSION_TYPES, jwtConfig, cookieConfig } = require('../config/sessionConfig');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with default role 'customer'
    console.log('Attempting to create user:', { name, email, role: 'customer' });
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'customer' // Default role
    });
    console.log('User created successfully:', { _id: user._id, name: user.name, email: user.email });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (err) {
    console.error('❌ Error in registerUser:', err.message);
    console.error('Error code:', err.code);
    console.error('Error name:', err.name);
    if (err.code === 11000) {
      console.error('Duplicate key error - user with this email already exists');
    }
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const sessionType = getSessionType();
      const response = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sessionType: sessionType
      };

      // Handle different session management strategies
      switch (sessionType) {
        case SESSION_TYPES.JWT:
          // JWT: Return token in response body
          const token = generateToken(user._id);
          response.token = token;
          console.log('🔐 JWT Login - Token in response body');
          break;

        case SESSION_TYPES.COOKIE:
          // Cookie: Set token in signed HTTP-only cookie
          const cookieToken = generateToken(user._id);
          res.cookie(cookieConfig.name, cookieToken, {
            httpOnly: cookieConfig.httpOnly,
            secure: cookieConfig.secure,
            sameSite: cookieConfig.sameSite,
            maxAge: cookieConfig.maxAge,
            signed: cookieConfig.signed
          });
          console.log('🍪 Cookie Login - Token in signed cookie');
          break;

        case SESSION_TYPES.SERVER_SIDE:
          // Server-side: Store userId in session
          req.session.userId = user._id.toString();
          req.session.userRole = user.role;
          console.log('💾 Server-side Login - UserId in session');
          break;

        default:
          // Default to JWT
          const defaultToken = generateToken(user._id);
          response.token = defaultToken;
          break;
      }

      res.json(response);
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile or /api/users/:id
// @access  Private/Public
exports.getUserProfile = async (req, res, next) => {
  try {
    let user;
    
    // If user is authenticated (from protect middleware), use req.user
    // Otherwise, get user by ID from params
    if (req.user) {
      user = req.user;
    } else {
      user = await User.findById(req.params.id).select('-password');
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!['customer', 'vendor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be customer, vendor, or admin' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};
