import express from 'express';
import { registerUser } from './auth.controller';

const authrouter = express.Router();

authrouter.post('/register', registerUser);

export default authrouter;