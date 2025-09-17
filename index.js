import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import "dotenv/config";
import { PrismaClient } from "./generated/prisma/index.js";
import { startServer } from "./server.js";
import bcrypt from "bcrypt";

// Prisma Client
const prisma = new PrismaClient();

// Équivalent de __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration Express
const app = express();

// Configuration du proxy de confiance (pour les déploiements derrière des proxies)
app.set('trust proxy', 1);

// Configuration CORS manuelle
app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.FRONT_URL || "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Gérer les requêtes preflight OPTIONS
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware pour parser les données des formulaires
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuration des sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "votre-clé-secrète-très-sécurisée",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure:
        process.env.FRONT_URL && process.env.FRONT_URL.startsWith("https"), // true si FRONT_URL utilise HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Configuration selon l'environnement
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
      httpOnly: true, // Empêche l'accès via JavaScript côté client
    },
  })
);

// Configuration du moteur de template
app.set("view engine", "twig");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// === ROUTES ===

// Route principale
app.get("/", async (req, res) => {
  // Vérification de l'état de connexion via session
  if (!req.session.user) {
    return res.redirect("/join");
  }

  const username = req.session.user.pseudo;

  try {
    // Vérification que l'utilisateur existe toujours en base et est actif
    const user = await prisma.user.findUnique({
      where: { pseudo: username },
    });

    if (!user || !user.isActive) {
      // Détruire la session si l'utilisateur n'existe plus ou est désactivé
      req.session.destroy();
      return res.redirect("/join");
    }

    // Récupération des messages
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    res.render("index", {
      username: username,
      messages: messages,
    });
  } catch (error) {
    console.error("Erreur récupération messages:", error);
    // En cas d'erreur, redirection vers la connexion
    res.redirect("/join");
  }
});

// Route de connexion (GET)
app.get("/join", (req, res) => {
  res.render("join");
});

// Route d'inscription (GET)
app.get("/register", (req, res) => {
  res.render("register");
});

// Route de connexion (POST)
app.post("/login", async (req, res) => {
  const { pseudo, password } = req.body;

  // Validation des données
  if (!pseudo || !password) {
    return res.status(400).render("join", {
      error: "Pseudo et mot de passe requis",
    });
  }

  try {
    // Recherche de l'utilisateur en base
    const user = await prisma.user.findUnique({
      where: { pseudo: pseudo },
    });

    // Vérification de l'existence de l'utilisateur
    if (!user) {
      return res.status(401).render("join", {
        error: "Pseudo ou mot de passe incorrect",
      });
    }

    // Vérification du mot de passe avec bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).render("join", {
        error: "Pseudo ou mot de passe incorrect",
      });
    }

    // Vérification que l'utilisateur est actif
    if (!user.isActive) {
      return res.status(403).render("join", {
        error: "Compte désactivé",
      });
    }

    // Connexion réussie - créer la session
    req.session.user = {
      id: user.id,
      pseudo: user.pseudo,
    };

    // Redirection vers le chat
    res.redirect("/");
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error);
    res.status(500).render("join", {
      error: "Erreur serveur, veuillez réessayer",
    });
  }
});

// Route d'inscription (POST)
app.post("/register", async (req, res) => {
  const { pseudo, email, password, confirmPassword } = req.body;

  // Validation des données
  if (!pseudo || !email || !password || !confirmPassword) {
    return res.status(400).render("register", {
      error: "Tous les champs sont requis",
      pseudo: pseudo || "",
      email: email || "",
    });
  }

  // Validation de la longueur du pseudo
  if (pseudo.length < 3 || pseudo.length > 20) {
    return res.status(400).render("register", {
      error: "Le pseudo doit contenir entre 3 et 20 caractères",
      pseudo: pseudo,
      email: email,
    });
  }

  // Validation de la longueur du mot de passe
  if (password.length < 6) {
    return res.status(400).render("register", {
      error: "Le mot de passe doit contenir au moins 6 caractères",
      pseudo: pseudo,
      email: email,
    });
  }

  // Validation de la confirmation du mot de passe
  if (password !== confirmPassword) {
    return res.status(400).render("register", {
      error: "Les mots de passe ne correspondent pas",
      pseudo: pseudo,
      email: email,
    });
  }

  // Validation de l'email (regex simple)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).render("register", {
      error: "Veuillez saisir une adresse email valide",
      pseudo: pseudo,
      email: email,
    });
  }

  try {
    // Vérifier si le pseudo existe déjà
    const existingUserByPseudo = await prisma.user.findUnique({
      where: { pseudo: pseudo },
    });

    if (existingUserByPseudo) {
      return res.status(409).render("register", {
        error: "Ce pseudo est déjà utilisé",
        pseudo: "",
        email: email,
      });
    }

    // Vérifier si l'email existe déjà
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUserByEmail) {
      return res.status(409).render("register", {
        error: "Cette adresse email est déjà utilisée",
        pseudo: pseudo,
        email: "",
      });
    }

    // Créer le nouvel utilisateur
    // Hacher le mot de passe avec bcrypt
    const bcrypt = require("bcrypt");
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        pseudo: pseudo,
        email: email,
        password: hashedPassword, // Mot de passe haché
        isActive: true,
      },
    });

    console.log(
      `✅ Nouvel utilisateur créé: ${newUser.pseudo} (${newUser.email})`
    );

    // Rediriger vers la page de connexion avec un message de succès
    res.render("join", {
      success: "Inscription réussie ! Vous pouvez maintenant vous connecter.",
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).render("register", {
      error: "Erreur serveur, veuillez réessayer",
      pseudo: pseudo,
      email: email,
    });
  }
});

// Route de déconnexion (POST)
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erreur lors de la déconnexion:", err);
    }
    res.redirect("/join");
  });
});

// Route de déconnexion (GET)
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erreur lors de la déconnexion:", err);
    }
    res.redirect("/join");
  });
});

// === DÉMARRAGE DU SERVEUR (uniquement si pas en mode test) ===
let server, io;

if (process.env.NODE_ENV !== "test") {
  const serverInstance = startServer(app, prisma);
  server = serverInstance.server;
  io = serverInstance.io;
}

// Exports pour les tests
export { app, server as httpServer, io, prisma, startServer };
