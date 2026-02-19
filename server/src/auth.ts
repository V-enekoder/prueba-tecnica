import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro_123";

export const authService = {
  // Generar token
  generateToken: (userId: number) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
  },

  // Middleware para proteger rutas
  authenticateToken: (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "No autorizado" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ error: "Token inválido o expirado" });
      }
      req.user = user;
      next();
    });
  },
};
