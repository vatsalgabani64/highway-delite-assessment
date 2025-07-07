import Note from "../models/Note";
import { Request, Response, RequestHandler } from "express"; // Import Request and Response

// Define an interface for the user object that your middleware attaches to the request
// Adjust properties (_id, userId) based on what your authentication middleware sets
interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        userId?: string; // Assuming userId might also be present for consistency
        // Add any other properties your req.user object might have, e.g., email: string;
    };
}

export const getNotes: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Ensure req.user exists before trying to access its properties
        if (!req.user || !req.user._id) {
            res.status(401).json({ message: "User not authenticated" }); // Removed 'return' from here
            return; // Explicitly return to end function execution
        }
        const notes = await Note.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error); // Log the actual error
        res.status(500).json({ message: "Error fetching notes" });
    }
}

export const createNote: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    const { title, content } = req.body;

    if (!title || !content) {
        res.status(400).json({ message: "Title and content are required" });
        return;
    }

    try {
        // Ensure req.user exists before trying to access its properties
        if (!req.user || !req.user._id) {
            res.status(401).json({ message: "User not authenticated" }); // Removed 'return' from here
            return; // Explicitly return to end function execution
        }

        const newNote = new Note({
            title,
            content,
            userId: req.user._id // Assuming userId for the Note model is req.user._id
        });

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (error) {
        console.error("Error creating note:", error); // Log the actual error
        res.status(500).json({ message: "Error creating note" });
    }
}

export const deleteNote: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Ensure req.user exists before trying to access its properties
        if (!req.user || (!req.user._id && !req.user.userId)) {
            res.status(401).json({ message: "User not authenticated" }); // Removed 'return' from here
            return; // Explicitly return to end function execution
        }

        // Use req.user._id for consistency if that's the primary user identifier
        // If your Note model stores userId as req.user.userId, use that.
        // I'm assuming req.user._id is the primary ID from the auth token/session.
        const note = await Note.findOneAndDelete({ _id: id, userId: req.user._id }); // Changed to req.user._id for consistency

        if (!note) {
            res.status(400).json({ message: "Note not found or you don't have permission to delete it" });
            return;
        }
        res.status(200).json({ message: "Note deleted" });
    } catch (error) {
        console.error("Error deleting note:", error); // Log the actual error
        res.status(500).json({ message: "Error deleting notes" });
    }
}
