var express = require('express');
const {
        JsonResposeError,
        JsonResponseData,
        JsonResponseSuccess,
} = require("../repository/helper/enums");
const {
        SelectWhereStatement,
        SelectAllStatement,
        InsertStatement,
        UpdateStatement,
} = require("../repository/helper/customhelper");
const { Masters } = require("../repository/model/masters");
const { Select, Insert, Update } = require("../repository/helper/dbconnect");
const { STATUS } = require("../repository/helper/dictionary");
const { EncrypterString, DecrypterString } = require("../repository/helper/crytography");
const jwt = require('jsonwebtoken');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

router.post('/login', async (req, res) => {
        try {
                const { username, password } = req.body;

                if (!username || !password) {
                        return res.status(400).json({ message: 'Username and password are required' });
                }

                async function ProcessData() {
                        let select_sql = SelectWhereStatement(
                                Masters.master_user.tablename,
                                [
                                        Masters.master_user.selectOptionsColumn.username,
                                        Masters.master_user.selectOptionsColumn.password,
                                        Masters.master_user.selectOptionsColumn.id,
                                        Masters.master_user.selectOptionsColumn.fullname,
                                        Masters.master_user.selectOptionsColumn.access,
                                        Masters.master_user.selectOptionsColumn.status
                                ],
                                [Masters.master_user.selectOptionsColumn.username],
                                [username]
                        );

                        let result = await Select(select_sql);

                        if (!result || result.length === 0) {
                                return res.status(401).json({ message: 'Invalid credentials' });
                        }

                        const user = result[0];

                        let select_access_routes_sql = SelectWhereStatement(
                                Masters.master_route_access.tablename,
                                [
                                        Masters.master_route_access.selectOptionsColumn.name,
                                        Masters.master_route_access.selectOptionsColumn.status,
                                ],
                                [Masters.master_route_access.selectOptionsColumn.access_id],
                                [user.mu_access]
                        );

                        let access_routes = await Select(select_access_routes_sql);

                        if (!user.mu_password) {
                                return res.status(401).json({ message: 'Invalid credentials2' });
                        }

                        if (user.mu_status !== 'active') {
                                return res.status(401).json({ message: 'User account is inactive' });
                        }

                        const decryptedPassword = DecrypterString(user.mu_password);
                        if (password !== decryptedPassword) {
                                return res.status(401).json({ message: 'Invalid credentials2' });
                        }

                        const token = jwt.sign(
                                {
                                    id: user.mu_id,
                                    mu_id: user.mu_id,
                                    username: user.mu_username,
                                    mu_username: user.mu_username,
                                    fullname: user.mu_fullname,
                                    mu_fullname: user.mu_fullname,
                                    access: user.mu_access,
                                    mu_access: user.mu_access,
                                    status: user.mu_status,
                                    mu_status: user.mu_status
                                },
                                "5L Secret Key",
                                { expiresIn: "24h" } // Extend token expiration to 24 hours
                        );

                        req.session.user = {
                                mu_id: user.mu_id,
                                mu_username: user.mu_username,
                                mu_fullname: user.mu_fullname,
                                mu_access: user.mu_access,
                                mu_status: user.mu_status
                        };

                        req.session.jwt = token;

                        const responseData = {
                                success: true,
                                message: 'Login successful',
                                token: token,
                                data: {
                                        id: user.mu_id,
                                        username: user.mu_username,
                                        fullname: user.mu_fullname,
                                        access_id: user.mu_access,
                                        status: user.mu_status
                                }
                        };
                        return res.status(200).json(responseData);
                }

                await ProcessData();
        } catch (error) {
                console.error("Error during login:", error);
                res.status(500).json(JsonResposeError(error));
        }
});

router.post('/logout', (req, res) => {
        req.session.destroy((err) => {
                if (err) {
                        return res.status(500).json({ message: 'Logout failed', error: err });
                }
                res.status(200).json({ message: 'Logout successful' });
        });
});