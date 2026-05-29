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
/* GET red_flags page. */
router.get('/', function (req, res, next) {
    res.render('red_flags', { title: 'Express' });
});

module.exports = router;


router.get('/getmode_of_transportation', async (req, res) => {
    try {
        const { searchValue, offset, limit } = req.query;

        let limitValue =
            limit && limit !== "0" && limit !== "-1" && limit !== ""
                ? parseInt(limit)
                : 999999;
        let offsetValue =
            offset && offset !== "0" && offset !== "-1" && offset !== ""
                ? parseInt(offset)
                : 0;

        if(searchValue && searchValue.trim() !== "") {
            
        } else {
            
        }
        let select_mode_of_transportation_sql = SelectStatement(
            `SELECT
            mmot_id as id,
            mmot_name as name,
            mmot_status as status
            FROM master_mode_of_transportation
            ${searchValue ? `WHERE mmot_name LIKE ? OR mmot_status LIKE ?` : ''}
            LIMIT ${limitValue} OFFSET ${offsetValue}`,
            searchValue ? [
                `%${searchValue}%`, `%${searchValue}%`
            ] : []
        );

        let mode_of_transportation_result = await Select(select_mode_of_transportation_sql);

        emitNotificationUpdate(req, 'fetched', {
            event: 'mode_of_transportation_fetched',
            status: 'success',
            count: mode_of_transportation_result.length,
            timestamp: new Date().toISOString()
        });

        const io = req.app.get('io');
        if (io) {
            io.emit('mode_of_transportation:fetched', {
                status: 'success',
                count: mode_of_transportation_result.length,
                timestamp: new Date().toISOString()
            });
        }
        return res.status(200).json({ mode_of_transportation_result });
    } catch (error) {
        console.error("Error fetching mode of transportation:", error);
        return res.status(500).json({
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage,
            sql: error.sql
        });
    }
});

router.put('/update_mode_of_transportation', async (req, res) => {
    try {
        const { id, name, status } = req.body;
        let update_mode_of_transportation_sql = UpdateStatement(
            Masters.master_mode_of_transportation.tablename,
            [Masters.master_mode_of_transportation.selectOptionsColumn.status,
                Masters.master_mode_of_transportation.selectOptionsColumn.name
            ],
            [Masters.master_mode_of_transportation.selectOptionsColumn.id]
        );
        let updateData = [[status, name, id]];
        await Update(update_mode_of_transportation_sql, updateData);

        return res.status(200).json({ message: 'Mode of transportation updated successfully' });
    } catch (error) {
        console.error("Error during update_mode_of_transportation:", error);

        res.status(500).json(JsonResposeError(error));
    }
});

router.post('/create_mode_of_transporation', async (req, res) => {
    try {
        const { name } = req.body;
        let ProcessData = async () => {
            let insert_mode_of_transporation_sql = InsertStatement(
                Masters.master_mode_of_transportation.tablename,
                Masters.master_mode_of_transportation.prefix,
                Masters.master_mode_of_transportation.insertColumns

            );
            let insertData = [[name, "ACTIVE"]];
            await Insert(insert_mode_of_transporation_sql, insertData);
        }
        await ProcessData();
        res.status(200).json({ message: 'Mode of transportation created successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json(JsonResposeError(error));
    }
});