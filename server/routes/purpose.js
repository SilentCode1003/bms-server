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
const { Masters } = require("../repository/model/masters");
const { Select, Insert, Update } = require("../repository/helper/dbconnect");
const { STATUS } = require("../repository/helper/dictionary");
const { EncrypterString, DecrypterString } = require("../repository/helper/crytography");
const jwt = require('jsonwebtoken');
var router = express.Router();

const emitNotificationUpdate = (req, event, data) => {
    const io = req.app.get('io');
    if (io) {
        io.emit(`notification:${event}`, data);
    }
};
/* GET purpose page. */
router.get('/', function (req, res, next) {
    res.render('purpose', { title: 'Express' });
});

module.exports = router;


router.get('/getpurpose', async (req, res) => {
    try {
        const { searchValue, offset, limit, status } = req.query;
        console.log(req.query);
        let limitValue =
            limit && limit !== "0" && limit !== "-1" && limit !== ""
                ? parseInt(limit)
                : 999999;
        let offsetValue =
            offset && offset !== "0" && offset !== "-1" && offset !== ""
                ? parseInt(offset)
                : 0;

        let purpose_result;

        if (status === 'ACTIVE') {
            let select_purpose_sql = SelectStatement(
                `SELECT
                mp_id as id,
                mp_code as code,
                mp_name as name,
                mp_type as type,
                mp_description as description,
                mp_status as status
                FROM master_purpose
                WHERE mp_status = 'ACTIVE' ${searchValue ? `AND (mp_code LIKE ? OR mp_name LIKE ? OR mp_type LIKE ?)` : ''}
                LIMIT ${limitValue} OFFSET ${offsetValue}`,
                searchValue ? [
                    `%${searchValue}%`, `%${searchValue}%`, `%${searchValue}%`
                ] : []
            );

            purpose_result = await Select(select_purpose_sql);
        } else {
            let select_purpose_sql = SelectStatement(
                `SELECT
                mp_id as id,
                mp_code as code,
                mp_name as name,
                mp_type as type,
                mp_description as description,
                mp_status as status
                FROM master_purpose
                ${searchValue ? `WHERE mp_code LIKE ? OR mp_name LIKE ? OR mp_type LIKE ? OR mp_status LIKE ?` : ''}
                LIMIT ${limitValue} OFFSET ${offsetValue}`,
                searchValue ? [
                    `%${searchValue}%`, `%${searchValue}%`, `%${searchValue}%`, `%${searchValue}%`
                ] : []
            );

            purpose_result = await Select(select_purpose_sql);
        }

        emitNotificationUpdate(req, 'fetched', {
            event: 'purpose_fetched',
            status: 'success',
            count: purpose_result.length,
            timestamp: new Date().toISOString()
        });

        const io = req.app.get('io');
        if (io) {
            io.emit('purpose:fetched', {
                status: 'success',
                count: purpose_result.length,
                timestamp: new Date().toISOString()
            });
        }
        return res.status(200).json({ purpose_result });
    } catch (error) {
        console.error("Error fetching purpose:", error);
        return res.status(500).json({
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage,
            sql: error.sql
        });
    }
});

router.put('/update_purpose', async (req, res) => {
    try {
        const { id, code, name, type, description, status } = req.body;
        console.log("Request body:", req.body);
        let update_purpose_sql = UpdateStatement(
            Masters.master_purpose.tablename,
            [Masters.master_purpose.selectOptionsColumn.code,
            Masters.master_purpose.selectOptionsColumn.name,
            Masters.master_purpose.selectOptionsColumn.type,
            Masters.master_purpose.selectOptionsColumn.description,
            Masters.master_purpose.selectOptionsColumn.status
            ],
            [Masters.master_purpose.selectOptionsColumn.id]
        );
        let updateData = [[code, name, type, description, status, id]];
        await Update(update_purpose_sql, updateData);

        return res.status(200).json({ message: 'Purpose updated successfully' });
    } catch (error) {
        console.error("Error during update_purpose:", error);

        res.status(500).json(JsonResposeError(error));
    }
});

router.post('/create_purpose', async (req, res) => {
    try {
        const { code, name, type, description } = req.body;
        let ProcessData = async () => {
            let insert_purpose_sql = InsertStatement(
                Masters.master_purpose.tablename,
                Masters.master_purpose.prefix,
                Masters.master_purpose.insertColumns

            );
            let insertData = [[code, name, type, description, "ACTIVE"]];
            await Insert(insert_purpose_sql, insertData);
        }
        await ProcessData();
        res.status(200).json({ message: 'Purpose created successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json(JsonResposeError(error));
    }
});