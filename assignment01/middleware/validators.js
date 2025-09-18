import { body } from "express-validator";

export const signUpValidators = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("phone").trim().matches(/^[\d\s()+\-]{7,20}$/).withMessage("Valid phone (7-20 digits/symbols) is required"),
    body("position").trim().notEmpty().withMessage("Position is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];