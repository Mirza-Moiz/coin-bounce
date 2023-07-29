const Joi = require('joi')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const UserDTO = require('../dto/user')
const JWTService = require('../services/JWTService')
const RefreshToken = require('../models/token')

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const authController = {

    // Registeration Controller

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
            const emailInUse = await User.exists({ email });
            const usernameInUse = await User.exists({ username });

            if (usernameInUse) {
                const error = {
                    status: 409,
                    message: "Username already in use, please chose another username."
                }
                return next(error);
            }
            if (emailInUse) {
                const error = {
                    status: 409,
                    message: "Email already registerd, use another email."
                }
                return next(error);
            }

        } catch (error) {
            return next(error);
        }

        // Hashing password
        const hashPassword = await bcrypt.hash(password, 10);

        // Storing user data in DB
        let user;
        let accessToken;
        let refreshToken;
        try {
            const userToRegister = new User({
                username,
                email,
                name,
                password: hashPassword,
            })

            user = await userToRegister.save();

            // Token generation
            accessToken = JWTService.signAccessToken({ _id: user._id }, '30m')
            refreshToken = JWTService.signRefreshToken({ _id: user._id }, '60m')
        } catch (error) {
            return next(error)
        }

        // Store refresh token in dataBase
        await JWTService.storeRefreshToken(refreshToken, user._id)

        //send Cookies
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
        })
        res.cookie("refreshToken", refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
        })

        // Filtering Response data
        const userDto = new UserDTO(user);
        // sending response
        return res.status(201).json({ user: userDto, auth: true });
    },





    async login(req, res, next) {

        // Login Controller

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

        const accessToken = JWTService.signAccessToken({ _id: user._id }, '30m')
        const refreshToken = JWTService.signRefreshToken({ _id: user._id }, '60m')


        // Update refresh token in dataBase
        try {
            await RefreshToken.updateOne({
                _id: user._id,
            },
                { token: refreshToken },
                { upsert: true }
            )

        } catch (error) {
            return next(error)

        }

        //sending Cookies
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
        })
        res.cookie("refreshToken", refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
        })

        const userDto = new UserDTO(user);
        return res.status(200).json({ user: userDto, auth: true })
    },

    async logout(req, res, next) {

        // Deleting refreshToken fron DataBase
        const { refreshToken } = req.cookies;
        try {
            await RefreshToken.deleteOne({ token: refreshToken });
        } catch (error) {
            return next(error);
        }

        // Deleting Cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        // Response
        res.status(200).json({ user: null, auth: false });
    },


    async refresh(req, res, next) {

        // Refresh Controller

        const originalRefreshToken = req.cookies.refreshToken;

        let id;
        try {
            id = JWTService.verifyRefreshToken(originalRefreshToken)._id;
        } catch (e) {
            const error = {
                status: 401,
                message: "unauthorized"
            }
            return next(error);
        }

        try {
            const match = RefreshToken.findOne({ _id: id, token: originalRefreshToken })
            if (!match) {
                const error = {
                    status: 401,
                    message: "Unauthorized"
                }
                return next(error);
            }
        } catch (error) {
            return next(error);
        }
        try {
            const accessToken = JWTService.signAccessToken({ _id: id }, '30m');
            const refreshToken = JWTService.signRefreshToken({ _id: id }, '60m');

            await RefreshToken.updateOne({ _id: id }, { token: refreshToken })

            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true
            });
            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true
            });
        } catch (error) {
            return next(error)
        }

        const user = await User.findOne({ _id: id });

        const userDto = new UserDTO(user);

        return res.status(200).json({ user: userDto, auth: true })
    }
}

module.exports = authController;