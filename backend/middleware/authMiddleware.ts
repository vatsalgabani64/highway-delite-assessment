import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express'; // Added RequestHandler

// Define an interface for the JWT payload
// Adjust properties based on what you store in your JWT
interface JwtPayload {
    _id: string;
    // Add any other properties you expect in your JWT payload, e.g., email: string;
}

// Augment the Express Request interface to include the 'user' property
// This tells TypeScript that req.user will exist after this middleware
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload; // Make it optional in case middleware hasn't run or failed
        }
    }
}

// Changed the type of authMiddleware to RequestHandler
export const authMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token format

    if (!token) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return; // Explicitly return to end function execution
    }

    // Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables.");
        res.status(500).json({ message: 'Server configuration error: JWT secret missing' });
        return; // Explicitly return to end function execution
    }

    try {
        // Type assertion for the decoded payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
        req.user = decoded; // Attach user info to request object
        next();
    } catch (error) {
        console.error("JWT verification error:", error); // Log the actual error
        res.status(403).json({ message: 'Forbidden: Invalid token' });
        return; // Explicitly return to end function execution
    }
};
