import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import {
  createUser,
  getUserByEmail,
  getUserById,
  createResetToken,
  getUserByResetToken,
  updatePassword,
  getUserByGoogleId,
  createGoogleUser,
  linkGoogleId,
} from "./database";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      username?: string;
      first_name?: string;
      last_name?: string;
      password?: string | null;
      google_id?: string | null;
      created_at: Date;
      updated_at: Date;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(
  supplied: string,
  stored: string | null | undefined,
) {
  if (!stored || !stored.includes(".")) {
    return false;
  }
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) {
    return false;
  }
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // Allow creating if needed
    tableName: "sessions",
  });

  const isProduction = process.env.NODE_ENV === "production";

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "dev-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: false, // HTTPS only in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: "lax", // Stricter in production
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // ── Local Strategy ──────────────────────────────────────────
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  // ── Google Strategy ─────────────────────────────────────────
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const callbackURL =
      (process.env.SERVER_URL ||
        `http://localhost:${process.env.NODE_PORT || 8005}`) +
      "/auth/google/callback";

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const googleId = profile.id;
            const email =
              profile.emails && profile.emails.length > 0
                ? profile.emails[0].value
                : null;

            if (!email) {
              return done(
                new Error("No email associated with this Google account"),
              );
            }

            // 1. Check if user already exists by googleId
            let user = await getUserByGoogleId(googleId);
            if (user) {
              return done(null, user);
            }

            // 2. Check if user exists by email (link accounts)
            user = await getUserByEmail(email);
            if (user) {
              user = await linkGoogleId(user.id, googleId);
              return done(null, user);
            }

            // 3. Create new user
            const firstName = profile.name?.givenName || undefined;
            const lastName = profile.name?.familyName || undefined;
            user = await createGoogleUser(email, googleId, firstName, lastName);
            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        },
      ),
    );

    console.log("✅ Google OAuth strategy configured");
  } else {
    console.warn(
      "⚠️  GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set – Google sign-in disabled",
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await getUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // ── Local auth routes ──────────────────────────────────────
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await createUser(
        req.body.email,
        await hashPassword(req.body.password),
        req.body.firstName,
        req.body.lastName,
      );

      req.login(user, (err) => {
        if (err) return next(err);
        res
          .status(201)
          .json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
          });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res
        .status(500)
        .json({
          message: "Registration failed",
          error: (error as Error).message,
        });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    const user = req.user!;
    res
      .status(200)
      .json({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      });
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user!;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    });
  });

  // ── Google auth routes ──────────────────────────────────────
  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] }),
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/auth?error=google_failed",
    }),
    (req, res) => {
      // Successful authentication – redirect to the frontend
      const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
      res.redirect(clientOrigin);
    },
  );

  // ── Password reset endpoints ────────────────────────────────
  app.post("/api/reset-password-request", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await getUserByEmail(email);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate reset token
      const token = randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 3600000); // 1 hour from now

      await createResetToken(email, token, expiry);

      // In production, you would send an email here
      res.json({
        message: "Password reset initiated",
        token, // Only for development - remove in production
        resetUrl: `${req.protocol}://${req.get("host")}/reset-password?token=${token}`,
      });
    } catch (error) {
      console.error("Reset password request error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      const user = await getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await updatePassword(user.id, hashedPassword);

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
}
