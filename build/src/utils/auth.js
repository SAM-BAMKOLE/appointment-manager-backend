"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomToken = exports.comparePassword = exports.hashPassword = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
require("dotenv").config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateAccessToken = (payload) => {
    // @ts-ignore
    return jsonwebtoken_1.default.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "1d",
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    // @ts-ignore
    return jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    return bcryptjs_1.default.hash(password, 12);
});
exports.hashPassword = hashPassword;
const comparePassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return bcryptjs_1.default.compare(password, hashedPassword);
});
exports.comparePassword = comparePassword;
const generateRandomToken = () => {
    return (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
};
exports.generateRandomToken = generateRandomToken;
