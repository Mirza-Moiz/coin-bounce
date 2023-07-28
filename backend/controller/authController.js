const Joi = require('joi')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const UserDTO = require('../dto/user')

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const authController = {
    async register(req, res, next) {
        // Validate user Input
        const userRegisterSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            name: Joi.string().max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref('password')
        });

        const { error } = userRegisterSchema.validate(req.body);

        // If Error in user Input
        if (error) {
            return next(error);
        }

        // IF email or username is already registered
        const { username, name, email, password } = req.body;
        try {
            const emailInUSe = await User.exists({ email });
            const usernameInUse = await User.exists({ username });

            if (emailInUSe) {
                const error = {
                    status: 409,
                    message: "Email already registerd, use another email."

                }
                return next(error);
            }
            if (usernameInUse) {
                const error = {
                    status: 409,
                    message: "Username already in use, please chose another username."
                }
                return next(error);
            }

        } catch (error) {
            return next(error);
        }

        // Hashing password
        const hashPassword = await bcrypt.hash(password, 10);

        // Storing user data in DB
        const userToRegister = new User({
            username,
            email,
            name,
            password: hashPassword,
        })

        const user = await userToRegister.save();

        // Filtering Response data
        const userDto = new UserDTO(user);
        // sending response
        return res.status(201).json({ user: userDto });
    },
    async login(req, res, next) {
        const userLoginSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            password: Joi.string().pattern(passwordPattern),
        });

        const { error } = userLoginSchema.validate(req.body);

        if (error) {
            return next(error)
        }

        const { username, password } = req.body;
        let user;
        try {
            user = await User.findOne({ username: username });

            if (!user) {
                const error = {
                    status: 401,
                    message: "invalid username"
                }
                return next(error)
            }
            const match = await bcrypt.compare(password, user.password)
            if (!match) {
                const error = {
                    status: 401,
                    message: "invalid password"
                }
                return next(error)
            }
        } catch (error) {
            return next(error);
        }
        const userDto = new UserDTO(user);
        return res.status(200).json({ user: userDto })
    },
}

module.exports = authController;