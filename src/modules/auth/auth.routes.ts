import express from 'express';
import { registerUser,loginUser } from './auth.controller';

const authrouter = express.Router();

authrouter.post('/register', registerUser);
authrouter.post('/login', loginUser);

export default authrouter;