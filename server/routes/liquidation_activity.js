var express = require('express');
const {
        JsonResposeError,
        JsonResponseData,
        JsonResponseSuccess,
} = require("../repository/helper/enums");
const {
        SelectStatement,
        SelectAllStatement,
        InsertStatement,
        UpdateStatement,
} = require("../repository/helper/customhelper");
const { Liquidations } = require("../repository/model/liquidation");
const { Select, Insert, Update } = require("../repository/helper/dbconnect");
const { STATUS } = require("../repository/helper/dictionary");
const { EncrypterString, DecrypterString } = require("../repository/helper/crytography");
const jwt = require('jsonwebtoken');
var router = express.Router();

/* GET liquidation_activity page. */
router.get('/', function (req, res, next) {
        res.render('liquidation_activity', { title: 'Express' });
});

module.exports = router;

router.get('/getliquidation_activity', async (req, res) => {
        try {
                async function ProcessData() {
                        let select_liquidation_activity_sql = SelectStatement(
                                `SELECT
                                lia_id as id,
                                lia_liquidation_id as liquidation_id,
                                lia_action as action,
                                lia_remarks as remarks,
                                lia_receipts as receipts,
                                lia_created_at as created_at,
                                lia_created_by as created_by
                                FROM liquidation_activity
                                `
                        );

                        let result = await Select(select_liquidation_activity_sql);

                        return res.status(200).json(result);
                }

                await ProcessData();
        } catch (error) {
                console.error("Error during login:", error);
                res.status(500).json(JsonResposeError(error));
        }
});

router.get('/getliquidation_activity_by_id', async (req, res) => {
        try {
                const { id } = req.query;

                if (!id) {
                        return res.status(400).json({ error: 'Liquidation ID is required' });
                }

                async function ProcessData() {
                        let select_liquidation_activity_sql = SelectStatement(
                                `SELECT
                                lia_id as id,
                                lia_liquidation_id as liquidation_id,
                                lia_action as action,
                                lia_remarks as remarks,
                                lia_receipts as receipts,
                                lia_created_at as created_at,
                                lia_created_by as created_by
                                FROM liquidation_activity
                                WHERE lia_liquidation_id = ?
                                `, [id]
                        );

                        let result = await Select(select_liquidation_activity_sql);

                        return res.status(200).json(result);
                }

                await ProcessData();
        } catch (error) {
                console.error("Error during login:", error);
                res.status(500).json(JsonResposeError(error));
        }
});