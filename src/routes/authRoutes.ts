import { Router } from "express";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../schemas/authSchema";
import { login, logout, register, refreshToken } from "../controllers/authController";

const router = Router();

router.post("/signup", validate(registerSchema), register);
router.post("/signin", validate(loginSchema), login);
router.post("/signout", logout);
router.post("/refresh", refreshToken);

export default router;
