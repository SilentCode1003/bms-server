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
                const { offset, limit } = req.query;
                let limitValue =
                        limit && limit !== "0" && limit !== "-1" && limit !== ""
                                ? parseInt(limit)
                                : 999999;
                let offsetValue =
                        offset && offset !== "0" && offset !== "-1" && offset !== ""
                                ? parseInt(offset)
                                : 0;
                async function ProcessData() {
                        let select_liquidation_activity_sql = SelectStatement(
                                `SELECT
                                lia_id AS id,
                                lia_liquidation_id AS liquidation_id,
                                lia_action AS action,
                                lia_remarks AS remarks,
                                lia_receipts AS receipts,
                                lia_created_at AS created_at,
                                CASE
                                WHEN lia_action = 'PREPARED' THEN CONCAT('Prepared by: ', lia_created_by)
                                WHEN lia_action = 'NOTED' THEN CONCAT('Noted by: ', lia_created_by)
                                WHEN lia_action = 'CHECKED' THEN CONCAT('Checked by: ', lia_created_by)
                                WHEN lia_action = 'APPROVED' THEN CONCAT('Approved by: ', lia_created_by)
                                WHEN lia_action = 'INCOMPLETE' THEN CONCAT('Marked incomplete by: ', lia_created_by)
                                WHEN lia_action = 'REJECTED' THEN CONCAT('Rejected by: ', lia_created_by)
                                ELSE lia_created_by
                                END AS name
                                FROM liquidation_activity
                                LIMIT ${limitValue} OFFSET ${offsetValue};
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
    lia_id AS id,
    lia_liquidation_id AS liquidation_id,
    lia_action AS action,
    lia_remarks AS remarks,
    lia_receipts AS receipts,
    lia_created_at AS created_at,
    CASE
        WHEN lia_action = 'PREPARED' THEN CONCAT('Prepared by: ', lia_created_by)
        WHEN lia_action = 'NOTED' THEN CONCAT('Noted by: ', lia_created_by)
        WHEN lia_action = 'CHECKED' THEN CONCAT('Checked by: ', lia_created_by)
        WHEN lia_action = 'APPROVED' THEN CONCAT('Approved by: ', lia_created_by)
        WHEN lia_action = 'INCOMPLETE' THEN CONCAT('Marked incomplete by: ', lia_created_by)
        WHEN lia_action = 'REJECTED' THEN CONCAT('Rejected by: ', lia_created_by)
        ELSE lia_created_by
    END AS name
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