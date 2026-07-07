const swaggerJSDoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Budget Monitoring System API",
      version: "1.0.0",
      description: "API documentation for Budget Monitoring System",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "/",
        description: "Current host and port",
      },
      {
        url: "http://localhost:5013",
        description: "Localhost",
      },
      {
        url: "http://192.168.40.249:5013",
        description: "Staging Server",
      },
      {
        url: "http://192.168.40.249:5013",
        description: "Development Server",
      },
      {
        url: "http://172.16.1.32:5003",
        description: "UAT Server",
      },
      {
        url: "http://192.168.40.249:5013",
        description: "Auth Server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      responses: {
        UnauthorizedError: {
          description: "Unauthorized - Invalid or missing token",
          headers: {
            "Access-Control-Allow-Origin": {
              schema: {
                type: "string",
                default: "*",
              },
            },
            "Access-Control-Allow-Credentials": {
              schema: {
                type: "boolean",
                default: true,
              },
            },
          },
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },

      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "An error occurred",
            },
            error: {
              type: "object",
              properties: {
                status: {
                  type: "integer",
                  example: 500,
                },
                message: {
                  type: "string",
                  example: "Internal Server Error",
                },
              },
            },
          },
          required: ["success", "message"],
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./repository/documentation/*.js"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
module.exports = swaggerDocs;

//#region Check login & logout API Documentation
/**
 * @swagger
 * /login/check-credentials:
 *   post:
 *     servers:
 *       - url: http://localhost:5000
 *         description: Auth Server
 *     summary: Login
 *     description: Authenticate a user by username and password, and return a JWT token upon successful login.
 *     tags:
 *       - Authentication
 *     security: []
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Successfully logged in"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   description: |
 *                     JWT token to be used in Authorization header for subsequent requests.
 *
 *                     After successful login, use this token in the Authorization header:
 *                     ```
 *                     Authorization: Bearer <token>
 *                     ```
 *
 *                     For example:
 *                     ```
 *                     fetch('http://localhost:5013/api/endpoint', {
 *                       headers: {
 *                         'Authorization': 'Bearer ' + response.token
 *                       }
 *                     })
 *                     ```
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "admin"
 *                     fullname:
 *                       type: string
 *                       example: "Administrator"
 *                     access:
 *                       type: integer
 *                       example: 1
 *                     position:
 *                       type: string
 *                       example: "Administrator"
 *                     status:
 *                       type: string
 *                       example: "active"
 *       400:
 *         description: Missing username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout
 *     description: Destroy the current session and logout the user.
 *     tags:
 *       - Authentication
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

//#endregion

//#region Dashboard API Documentation
/**
 * @swagger
 * /dashboard/get_finance_cards:
 *   get:
 *     summary: Get finance cards summary
 *     description: Retrieve a summary of finance cards data
 *     tags:
 *       - Dashboard
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date of the date range
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date of the date range
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved finance cards summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pending_requests:
 *                   type: integer
 *                 released_vouchers_count:
 *                   type: integer
 *                 verified_liquidations_count:
 *                   type: integer
 *                 released_vouchers_total:
 *                   type: number
 *                 verified_liquidations_total:
 *                   type: number
 *                 outstanding_balance:
 *                   type: number
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /dashboard/get_finance_charts:
 *   get:
 *     summary: Get finance charts data
 *     description: Retrieve outstanding balance and cash flow data for finance charts
 *     tags:
 *       - Dashboard
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date of the date range
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date of the date range
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved finance charts data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       outstanding_balance:
 *                         type: number
 *                 cash_flow_result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       total_cash_request:
 *                         type: number
 *                       total_liquidation:
 *                         type: number
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /dashboard/get_requester_cards:
 *   get:
 *     summary: Get requester cards data
 *     description: Retrieve requester-specific cash request and liquidation counts
 *     tags:
 *       - Dashboard
 *     parameters:
 *       - in: query
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the employee to fetch requester card data for
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date of the date range
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date of the date range
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved requester cards data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pending_requests:
 *                   type: integer
 *                   description: Number of pending cash requests for this employee
 *                 approved_requests:
 *                   type: integer
 *                   description: Number of approved cash requests for this employee
 *                 pending_liquidations:
 *                   type: integer
 *                   description: Number of pending liquidations for this employee
 *                 approved_liquidations:
 *                   type: integer
 *                   description: Number of approved liquidations for this employee
 *       400:
 *         description: Missing employee_id parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /dashboard/get_teamleader_cards:
 *   get:
 *     summary: Get team leader cards data
 *     description: Retrieve team leader cards data for a specific employee
 *     tags:
 *       - Dashboard
 *     parameters:
 *       - in: query
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The employee ID to filter team leader card data
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date of the date range
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date of the date range
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved team leader cards data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pending_requests:
 *                   type: number
 *                 approved_requests:
 *                   type: number
 *                 pending_liquidations:
 *                   type: number
 *                 approved_liquidations:
 *                   type: number
 *       400:
 *         description: Missing employee_id query parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /dashboard/get_store_and_location_expenses:
 *   get:
 *     summary: Get expenses by store and location
 *     description: Retrieve a list of expenses by store and location
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Successfully retrieved expenses by store and location
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 store_result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       store_name:
 *                         type: string
 *                       total_amount:
 *                         type: number
 *                 location_result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       location_name:
 *                         type: string
 *                       total_amount:
 *                         type: number
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

//#endregion

//#region Master Route Access API Documentation

/**
 * @swagger
 * /route_access/getroute_access:
 *   get:
 *     summary: Get all route access records
 *     description: Retrieve a list of all master route access entries
 *     tags:
 *       - Master Route Access
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved route access records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MasterRouteAccess'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /route_access/getroute_access_table:
 *   get:
 *     summary: Get route access table
 *     description: Retrieve a table of master route access entries. Optionally filter by access_id.
 *     tags:
 *       - Master Route Access
 *     parameters:
 *       - in: query
 *         name: access_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by access ID
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved route access table
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MasterRouteAccess'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /route_access/createroute_access:
 *   post:
 *     summary: Create a new route access
 *     description: Add a new master route access entry to the system
 *     tags:
 *       - Master Route Access
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Full Access, No Access]
 *     responses:
 *       200:
 *         description: Successfully created route access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /route_access/createbulk_route_access:
 *   post:
 *     summary: Create bulk route access records
 *     description: Inserts multiple predefined route access records for a given access_id.
 *                  Each record will be assigned "No Access" as the default status unless it already exists.
 *     tags:
 *       - Master Route Access
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - access_id
 *             properties:
 *               access_id:
 *                 type: integer
 *                 description: The access ID to associate with the route access records
 *                 example: 15
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully created bulk route access records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Bulk route access created successfully
 *       400:
 *         description: Missing or invalid access_id in request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: access_id is required
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to create bulk route access
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /route_access/updateroute_access:
 *   put:
 *     summary: Update an existing route access
 *     description: Update master route access details based on ID
 *     tags:
 *       - Master Route Access
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               access_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Successfully updated route access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /route_access/update_status:
 *   put:
 *     summary: Update the status of a route access entry
 *     description: Update the status of a master route access record by its ID.
 *     tags:
 *       - Master Route Access
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID of the route access entry to update
 *               status:
 *                 type: string
 *                 enum: [Full Access, No Access, View]
 *                 description: New status value
 *     responses:
 *       200:
 *         description: Successfully updated status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MasterRouteAccess:
 *       type: object
 *       properties:
 *         mra_id:
 *           type: integer
 *           description: Unique identifier for the route access entry
 *           example: 1
 *         mra_access_id:
 *           type: integer
 *           description: Foreign key reference to access group or role
 *           example: 2
 *         mra_name:
 *           type: string
 *           description: Name of the route or feature being accessed
 *           example: "Cash Request Module"
 *         mra_status:
 *           type: string
 *           description: Status of the access permission
 *           enum: [Full Access, No Access, View]
 *           example: "Full Access"
 *         mra_created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the route access record was created
 *           example: "2025-08-28T12:34:56Z"
 *         mra_created_by:
 *           type: integer
 *           description: ID of the user who created the record
 *           example: 101
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Internal Server Error"
 *         error:
 *           type: string
 *           example: "Database connection failed"
 */

//#endregion

//#region Cash Request API Documentation

/**
 * @swagger
 * components:
 *   schemas:
 *     CashRequest:
 *       type: object
 *       properties:
 *         cr_id:
 *           type: integer
 *         cr_reference_id:
 *           type: string
 *         cr_cv_number:
 *           type: string
 *         cr_description:
 *           type: string
 *         cr_employee_id:
 *           type: string
 *         cr_department_id:
 *           type: string
 *         cr_position:
 *           type: string
 *         cr_amount:
 *           type: number
 *           format: float
 *         cr_request_date:
 *           type: string
 *           format: date
 *         cr_status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, COMPLETED]
 *         activities:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CashRequestActivity'
 *         liquidation:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Liquidation'
 *
 *     CashRequestActivity:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         cash_request_id:
 *           type: integer
 *         action:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, COMPLETED]
 *         remarks:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         created_by:
 *           type: integer
 *
 *     Liquidation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         cash_request_id:
 *           type: integer
 *         amount:
 *           type: number
 *           format: float
 *         receipt_number:
 *           type: string
 *         remarks:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         created_at:
 *           type: string
 *           format: date-time
 *         created_by:
 *           type: integer
 *         updated_at:
 *           type: string
 *           format: date-time
 *         updated_by:
 *           type: integer
 */

/**
 * @swagger
 * /cash_request/getapproved_cash_request:
 *   get:
 *     summary: Get approved cash requests by status
 *     description: Retrieve a list of approved cash requests filtered by status (approved, completed, rejected) and date range.
 *     tags:
 *       - Cash Request
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [approved, completed, rejected]
 *         required: false
 *         description: Filter cash requests by status
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter cash requests by start date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter cash requests by end date
 *     responses:
 *       200:
 *         description: Successfully retrieved approved cash requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   reference_id:
 *                     type: string
 *                   cv_number:
 *                     type: string
 *                   description:
 *                     type: string
 *                   team_lead:
 *                     type: string
 *                   employee:
 *                     type: string
 *                   employee_id:
 *                     type: string
 *                   department:
 *                     type: string
 *                   position:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   request_date:
 *                     type: string
 *                   status:
 *                     type: string
 *                   subtotal:
 *                     type: number
 *                   cash_request_activities:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         cash_request_id:
 *                           type: integer
 *                         action:
 *                           type: string
 *                         remarks:
 *                           type: string
 *                         created_at:
 *                           type: string
 *                         requested_by:
 *                           type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /cash_request/getcash_request:
 *   get:
 *     summary: Get cash requests with items and activities
 *     description: Retrieve a list of cash requests with their associated items and activities. Can be filtered by status, employee_id, start_date, and end_date.
 *     tags:
 *       - Cash Request
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [approved, rejected, completed, pending]
 *         required: false
 *         description: Filter cash requests by status. 'approved' will include both 'approved' and 'completed' statuses.
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter cash requests by employee ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter cash requests by start date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter cash requests by end date
 *     responses:
 *       200:
 *         description: Successfully retrieved cash requests with items and activities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   reference_id:
 *                     type: string
 *                   cv_number:
 *                     type: string
 *                   description:
 *                     type: string
 *                   team_lead:
 *                     type: string
 *                   employee:
 *                     type: string
 *                   employee_id:
 *                     type: string
 *                   department:
 *                     type: string
 *                   position:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   request_date:
 *                     type: string
 *                   status:
 *                     type: string
 *                   subtotal:
 *                     type: number
 *                   activities:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         cash_request_id:
 *                           type: integer
 *                         action:
 *                           type: string
 *                         remarks:
 *                           type: string
 *                         created_at:
 *                           type: string
 *                         requested_by:
 *                           type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /cash_request/getexisting_liquidation:
 *   get:
 *     summary: Get existing liquidation records by employee ID
 *     description: Retrieve liquidation records that are in "verified" status for a given employee.
 *     tags:
 *       - Cash Request
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the employee whose liquidation records should be fetched.
 *     responses:
 *       200:
 *         description: Successfully retrieved existing liquidation records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Cash request ID linked to the liquidation
 *       400:
 *         description: Invalid or missing employee_id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /cash_request/getexisting_cash_request:
 *   get:
 *     summary: Get existing cash requests without liquidation
 *     description: Retrieve a cash request record by ID that does not have an associated liquidation.
 *     tags:
 *       - Cash Request
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the cash request to check for liquidation association.
 *       - in: query
 *         name: notification
 *         schema:
 *           type: integer
 *         description: The notification value (e.g., 0, 1, etc.)
 *     responses:
 *       200:
 *         description: Successfully retrieved cash request without liquidation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Cash request ID that has no associated liquidation
 *       400:
 *         description: Invalid or missing request ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /cash_request/createcash_request:
 *   post:
 *     summary: Create a new cash request
 *     description: Adds a new cash request along with its items and activity log.
 *     tags:
 *       - Cash Request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - team_lead
 *               - employee
 *               - employee_id
 *               - department
 *               - position
 *               - amount
 *             properties:
 *               description:
 *                 type: string
 *                 description: Description for the cash request.
 *               team_lead:
 *                 type: string
 *                 description: Team lead ID creating the cash request.
 *               employee:
 *                 type: string
 *                 description: Employee name or ID creating the cash request.
 *               employee_id:
 *                 type: string
 *                 description: Employee ID creating the cash request.
 *               department:
 *                 type: string
 *                 description: Department ID.
 *               position:
 *                 type: string
 *                 description: Position of the requester.
 *               amount:
 *                 type: number
 *                 description: Total amount requested.
 *               remarks:
 *                 type: string
 *                 nullable: true
 *                 description: Additional remarks.
 *               requested_by:
 *                 type: string
 *                 nullable: true
 *                 description: ID of the employee who created the request.
 *     responses:
 *       200:
 *         description: Successfully created cash request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       400:
 *         description: Invalid input (e.g., missing fields or invalid JSON)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /cash_request/undo_cash_request:
 *   put:
 *     summary: Undo a previously created cash request
 *     description: Deletes a cash request and its activity logs. Either cash_request_id must be provided.
 *     tags:
 *       - Cash Request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cash_request_id
 *             properties:
 *               cash_request_id:
 *                 type: integer
 *                 description: The ID of the cash request to undo.
 *     responses:
 *       200:
 *         description: Successfully undone the cash request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Undo successful"
 *       400:
 *         description: Missing required identifying fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing cash_request_id"
 *       404:
 *         description: Cash request not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cash request not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /cash_request/updatecash_request:
 *   put:
 *     summary: Update an existing cash request
 *     description: Update cash request based on ID
 *     tags:
 *       - Cash Request
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - id
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, COMPLETED, REJECTED]
 *               id:
 *                 type: integer
 *               remarks:
 *                 type: string
 *                 nullable: true
 *               updated_by:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated cash request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input (e.g., missing fields or invalid JSON)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /cash_request/update_cash_request_rejected:
 *   put:
 *     summary: Update a previously rejected cash request
 *     description: Update the details of a rejected cash request and set its status back to `PENDING`. It also removes the rejection activity log and adds an update activity record.
 *     tags:
 *       - Cash Request
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cash_request_id
 *               - updated_by
 *             properties:
 *               cash_request_id:
 *                 type: integer
 *                 description: ID of the cash request to update
 *               date:
 *                 type: string
 *                 description: Updated date of the cash request
 *               description:
 *                 type: string
 *                 description: Updated description of the cash request
 *               team_lead:
 *                 type: string
 *                 description: Updated team lead for the cash request
 *               amount:
 *                 type: number
 *                 description: Updated amount of the cash request
 *               updated_by:
 *                 type: string
 *                 description: User who updated the request
 *     responses:
 *       200:
 *         description: Successfully updated the rejected cash request and reset its status to pending
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required fields or no fields to update
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cash request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /cash_request/updatecash_request_notification:
 *   put:
 *     summary: Update cash request notification status
 *     description: Update the notification status of a cash request
 *     tags:
 *       - Cash Request
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - notification
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID of the cash request
 *               notification:
 *                 type: integer
 *                 description: Updated notification status
 *                 example: 0
 *     responses:
 *       200:
 *         description: Successfully updated cash request notification status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required fields or invalid JSON
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

//#endregion

//#region Cash Request Activity API Documentation
/**
 * @swagger
 * /cash_request_activity/getcash_request_activity:
 *   get:
 *     summary: Get all cash request activities
 *     description: Retrieve a list of all cash request activities
 *     tags:
 *       - Cash Request Activity
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved cash request activities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   cash_request_id:
 *                     type: integer
 *                   action:
 *                     type: string
 *                   remarks:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

//#endregion

//#region Liquidation API Documentation

/**
 * @swagger
 * /liquidation/getcash_liquidation:
 *   get:
 *     summary: Get cash liquidations with items and filters
 *     description: Retrieve a list of cash liquidations with their items. Can be filtered by status, employee_id, start date, and end date.
 *     tags:
 *       - Liquidation
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, verified, completed, rejected]
 *         required: false
 *         description: Filter liquidations by status. 'verified' will include both 'verified' and 'completed' statuses.
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter liquidations by employee ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter liquidations by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter liquidations by end date
 *     responses:
 *       200:
 *         description: Successfully retrieved cash liquidations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   reference_id:
 *                     type: string
 *                   cv_number:
 *                     type: string
 *                   employee:
 *                     type: string
 *                   department:
 *                     type: string
 *                   position:
 *                     type: string
 *                   description:
 *                     type: string
 *                   amount_obtained:
 *                     type: number
 *                   amount_expended:
 *                     type: number
 *                   reimburse_return:
 *                     type: number
 *                   created_date:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                   liquidation_items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         liquidation_id:
 *                           type: integer
 *                         date:
 *                           type: string
 *                         rt:
 *                           type: string
 *                         store_name:
 *                           type: string
 *                         particulars:
 *                           type: string
 *                         from:
 *                           type: string
 *                         to:
 *                           type: string
 *                         mode_of_transportation:
 *                           type: string
 *                         amount:
 *                           type: number
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation/getcash_liquidation_id:
 *   get:
 *     summary: Get liquidation activities by Liquidation ID
 *     description: Retrieve activities for a specific liquidation
 *     tags:
 *       - Liquidation
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Liquidation ID
 *     responses:
 *       200:
 *         description: Successfully retrieved liquidation activities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   liquidation_id:
 *                     type: integer
 *                   action:
 *                     type: string
 *                   remarks:
 *                     type: string
 *                   receipts:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   created_by:
 *                     type: string
 *       400:
 *         description: Missing or invalid ID
 *       404:
 *         description: No activities found for this liquidation
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /liquidation/getliquidation_by_cv_number:
 *   get:
 *     summary: Get liquidation by CV Number
 *     description: Retrieve liquidation record by CV Number
 *     tags:
 *       - Liquidation
 *     parameters:
 *       - in: query
 *         name: cv_number
 *         schema:
 *           type: string
 *           description: CV Number of the liquidation
 *         required: true
 *         description: The CV Number of the liquidation
 *     responses:
 *       200:
 *         description: Successfully retrieved liquidation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   reference_id:
 *                     type: string
 *                   description:
 *                     type: string
 *                   amount_obtained:
 *                     type: number
 *                   amount_expended:
 *                     type: number
 *                   reimburse_return:
 *                     type: number
 *                   created_date:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *       400:
 *         description: Missing or invalid CV Number
 *       404:
 *         description: No liquidation found for this CV Number
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /liquidation/getapproved_liquidation:
 *   get:
 *     summary: Get approved liquidations within a date range
 *     description: Retrieve all approved liquidation records along with their request items and activity logs within a specific date range.
 *     tags:
 *       - Liquidation
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, verified, completed, rejected]
 *           description: If provided, only return liquidations with this status.
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           description: Start date of the date range. Defaults to current date if not provided.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           description: End date of the date range. Defaults to current date if not provided.
 *     responses:
 *       200:
 *         description: Successful Operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   cr_reference_id:
 *                     type: string
 *                   cv_number:
 *                     type: string
 *                   employee:
 *                     type: string
 *                   employee_id:
 *                     type: integer
 *                   department:
 *                     type: string
 *                   position:
 *                     type: string
 *                   description:
 *                     type: string
 *                   amount_obtained:
 *                     type: number
 *                   amount_expended:
 *                     type: number
 *                   reimburse_return:
 *                     type: number
 *                   created_date:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                     enum: [checked,approved, completed, rejected]
 *                   amount:
 *                     type: number
 *                   liquidation_items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         liquidation_id:
 *                           type: integer
 *                         date:
 *                           type: string
 *                           format: date-time
 *                         rt:
 *                           type: string
 *                         store_name:
 *                           type: string
 *                         particulars:
 *                           type: string
 *                         from:
 *                           type: string
 *                         to:
 *                           type: string
 *                         mode_of_transportation:
 *                           type: string
 *                         amount:
 *                           type: number
 *                   liquidation_activities:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         liquidation_id:
 *                           type: integer
 *                         action:
 *                           type: string
 *                         remarks:
 *                           type: string
 *                         receipts:
 *                           type: string
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         created_by:
 *                           type: integer
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation/getstore_by_liquidation:
 *   get:
 *     summary: Get store by liquidation
 *     description: Retrieves a list of stores associated with a specific liquidation item.
 *     tags:
 *       - Liquidation
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: store_name
 *         required: true
 *         schema:
 *           type: string
 *         description: The store name
 *     responses:
 *       200:
 *         description: Successfully retrieved stores by liquidation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   l_cr_reference_id:
 *                     type: integer
 *                   li_store_name:
 *                     type: string
 *                   cr_employee:
 *                     type: string
 *                   l_created_date:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Missing or invalid store name
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation/update_liquidation:
 *   put:
 *     summary: Update liquidation status
 *     description: Update the status of an existing liquidation and create liquidation activity. When status is verified, this endpoint also triggers accounting payload posting.
 *     tags:
 *       - Liquidation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, verified, completed, rejected, incomplete]
 *               id:
 *                 type: integer
 *               remarks:
 *                 type: string
 *               receipts:
 *                 type: string
 *                 description: Receipt metadata or encoded receipts payload
 *               created_by:
 *                 type: string
 *             required:
 *               - status
 *               - id
 *     responses:
 *       200:
 *         description: Liquidation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing required fields or invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation/getroutes_by_liquidation:
 *   get:
 *     summary: Get routes by liquidation
 *     description: Retrieves the routes associated with a specific liquidation item.
 *     tags:
 *       - Liquidation
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: reference_id
 *         schema:
 *           type: string
 *         description: The reference ID of the liquidation item
 *       - in: query
 *         name: store_name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the store
 *       - in: query
 *         name: mode_of_transportation
 *         required: false
 *         schema:
 *           type: string
 *         description: The mode of transportation
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: The start date of the liquidation item
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: The end date of the liquidation item
 *     responses:
 *       200:
 *         description: Successfully retrieved routes by liquidation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   li_id:
 *                     type: integer
 *                   li_liquidation_id:
 *                     type: integer
 *                   li_store_name:
 *                     type: string
 *                   li_from:
 *                     type: string
 *                   li_to:
 *                     type: string
 *                   li_mode_of_transportation:
 *                     type: string
 *                   li_amount:
 *                     type: number
 *                   li_created_date:
 *                     type: string
 *                     format: date-time
 *                   li_created_by:
 *                     type: string
 *       400:
 *         description: Missing or invalid reference ID or store name
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation/create_liquidation:
 *   post:
 *     summary: Create a new cash liquidation
 *     description: Creates a new liquidation record along with its request items and activity log.
 *     tags:
 *       - Liquidation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reference_id
 *               - description
 *               - amount_obtained
 *               - amount_expended
 *               - reimburse_return
 *               - remarks
 *               - created_by
 *               - receipts
 *               - request_items
 *             properties:
 *               reference_id:
 *                 type: string
 *                 example: "CR-250905-0002"
 *               description:
 *                 type: string
 *                 example: "Liquidation for travel expenses"
 *               amount_obtained:
 *                 type: number
 *                 example: 5000
 *               amount_expended:
 *                 type: number
 *                 example: 41240
 *               reimburse_return:
 *                 type: number
 *                 example: 200
 *               remarks:
 *                 type: string
 *                 example: "Submitted with receipts"
 *               created_by:
 *                 type: string
 *                 example: "John Doe"
 *               receipts:
 *                 type: array
 *                 description: List of receipts
 *                 items:
 *                   type: string
 *                   format: binary
 *                   nullable: true
 *                   description: Optional receipt file or base64 string
 *               request_items:
 *                 type: array
 *                 description: List of liquidation request items
 *                 items:
 *                   type: object
 *                   required:
 *                     - date
 *                     - rt
 *                     - store_name
 *                     - particulars
 *                     - reason
 *                     - from
 *                     - to
 *                     - mode_of_transportation
 *                     - amount
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2025-09-03"
 *                     rt:
 *                       type: string
 *                       example: "RT123"
 *                     store_name:
 *                       type: string
 *                       example: "ABC Supplies"
 *                     particulars:
 *                       type: string
 *                       example: "Printer ink"
 *                     reason:
 *                       type: string
 *                       example: "Printer ink"
 *                     from:
 *                       type: string
 *                       example: "Office"
 *                     to:
 *                       type: string
 *                       example: "Supplier"
 *                     mode_of_transportation:
 *                       type: string
 *                       example: "Taxi"
 *                     amount:
 *                       type: number
 *                       example: 350.50
 *     responses:
 *       200:
 *         description: Successfully created cash liquidation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: SUCCESS
 *       400:
 *         description: Missing required fields or invalid request items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation/undo_liquidation:
 *   put:
 *     summary: Undo a liquidation action
 *     description: >
 *       Reverts a liquidation by:
 *       - Removing the **CHECKED** liquidation activity
 *       - Resetting liquidation status back to **approved**
 *       - Creating a new liquidation activity entry with action **REVERTED**
 *     tags:
 *       - Liquidation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - liquidation_id
 *             properties:
 *               liquidation_id:
 *                 type: int
 *                 description: ID of the liquidation record to undo.
 *     responses:
 *       200:
 *         description: Undo liquidation completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: int
 *                   example: "Undo liquidation successful"
 *       400:
 *         description: Missing or invalid liquidation_id.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: int
 *                   example: "Missing liquidation_id"
 *       404:
 *         description: Liquidation record not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: int
 *                   example: "Liquidation not found"
 *       500:
 *         description: Internal Server Error during the undo process.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation/update_liquidation_rejected:
 *   put:
 *     summary: Update rejected liquidation
 *     description: Update liquidation items and activity remarks/receipts for a rejected liquidation. Only items with valid IDs can be updated. Activity will update the "PREPARED" action.
 *     tags:
 *       - Liquidation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - liquidation_id
 *             properties:
 *               liquidation_id:
 *                 type: integer
 *                 description: ID of the liquidation being updated
 *               items:
 *                 type: array
 *                 description: List of liquidation items to update
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Liquidation item ID
 *               remarks:
 *                 type: string
 *                 description: Remarks for the liquidation activity
 *               receipts:
 *                 type: array
 *                 description: Array of receipts with IDs and base64 images
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Receipt identifier
 *                     image:
 *                       type: string
 *                       description: Base64 encoded image
 *               status:
 *                 type: string
 *                 description: Liquidation status
 *     responses:
 *       200:
 *         description: Successfully updated liquidation and activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Missing required fields or invalid item data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation/update_liquidation_notification:
 *   put:
 *     summary: Update cash liquidation notification
 *     description: Update a cash liquidation notification by ID.
 *     tags:
 *       - Liquidation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - notification
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Liquidation ID
 *                 example: 123
 *               notification:
 *                 type: integer
 *                 description: Notification value (e.g., 0, 1, etc.)
 *                 example: 0
 *     responses:
 *       200:
 *         description: Successfully updated cash liquidation notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: "SUCCESS"
 *       400:
 *         description: Bad Request (Invalid input)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

//#endregion

//#region Liquidation Item

/**
 * @swagger
 * /liquidation_item/getliquidation_item:
 *   get:
 *     summary: Get all liquidation items
 *     description: Retrieves a list of all liquidation items with their details
 *     tags:
 *       - Liquidation Item
 *     responses:
 *       200:
 *         description: Successfully retrieved liquidation items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Liquidation item ID
 *                   cash_request_id:
 *                     type: integer
 *                     description: Associated cash request ID
 *                   label:
 *                     type: string
 *                     description: Item label or description
 *                   price:
 *                     type: number
 *                     format: decimal
 *                     description: Item price
 *                   quantity:
 *                     type: integer
 *                     description: Item quantity
 *                   subtotal:
 *                     type: number
 *                     format: decimal
 *                     description: Item subtotal (price * quantity)
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation_item/getliquidation_item_by_id:
 *   get:
 *     summary: Get liquidation item by ID
 *     description: Retrieves a specific liquidation item by its ID
 *     tags:
 *       - Liquidation Item
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The liquidation item ID
 *     responses:
 *       200:
 *         description: Successfully retrieved liquidation item
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Liquidation item ID
 *                   liquidation_id:
 *                     type: integer
 *                     description: Associated liquidation ID
 *                   from:
 *                     type: string
 *                     description: Starting location
 *                   to:
 *                     type: string
 *                     description: Destination location
 *                   li_mode_of_transportation:
 *                     type: string
 *                     description: Mode of transportation used
 *                   amount:
 *                     type: number
 *                     format: decimal
 *                     description: Transportation amount
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation_item/getliquidation_item_stats:
 *   get:
 *     summary: Get liquidation item statistics
 *     description: Retrieves various statistics about liquidation items
 *     tags:
 *       - Liquidation Item
 *     responses:
 *       200:
 *         description: Successfully retrieved liquidation item statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   started_from:
 *                     type: string
 *                     description: Starting location
 *                   ended_to:
 *                     type: string
 *                     description: Destination location
 *                   mode_of_transportation:
 *                     type: string
 *                     description: Mode of transportation used
 *                   avg_amount:
 *                     type: number
 *                     format: decimal
 *                     description: Average transportation amount
 *                   min_amount:
 *                     type: number
 *                     format: decimal
 *                     description: Minimum transportation amount
 *                   max_amount:
 *                     type: number
 *                     format: decimal
 *                     description: Maximum transportation amount
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation_item/getliquidation_item_started_from:
 *   get:
 *     summary: Get distinct starting locations for liquidation items
 *     description: Retrieve a list of distinct starting locations for liquidation items
 *     tags:
 *       - Liquidation Item
 *     responses:
 *       200:
 *         description: Successfully retrieved distinct starting locations for liquidation items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   started_from:
 *                     type: string
 *                     description: Distinct starting location for liquidation items
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation_item/getliquidation_item_ended_to:
 *   get:
 *     summary: Get distinct ending locations for liquidation items
 *     description: Retrieve a list of distinct ending locations for liquidation items
 *     tags:
 *       - Liquidation Item
 *     responses:
 *       200:
 *         description: Successfully retrieved distinct ending locations for liquidation items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ended_to:
 *                     type: string
 *                     description: Distinct ending location for liquidation items
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation_item/getliquidation_item_mode_of_transportation:
 *   get:
 *     summary: Get distinct mode of transportation for liquidation items
 *     description: Retrieve a list of distinct modes of transportation for liquidation items
 *     tags:
 *       - Liquidation Item
 *     responses:
 *       200:
 *         description: Successfully retrieved distinct modes of transportation for liquidation items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   mode_of_transportation:
 *                     type: string
 *                     description: Distinct mode of transportation for liquidation items
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation_item/getliquidation_start_location:
 *   get:
 *     summary: Get distinct li_from values for liquidation items
 *     description: Retrieve a list of distinct trimmed li_from values from liquidation_item
 *     tags:
 *       - Liquidation Item
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           default: ""
 *         description: Search term to filter `li_from` (substring match, case-insensitive)
 *     responses:
 *       200:
 *         description: Successfully retrieved distinct li_from values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       li_from:
 *                         type: string
 *                         description: Distinct trimmed li_from value from liquidation_item
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation_item/getstore_routes:
 *   get:
 *     summary: Get distinct store routes for liquidation items
 *     description: Retrieve a list of distinct store routes for liquidation items
 *     tags:
 *       - Liquidation Item
 *     parameters:
 *       - name: store_name
 *         in: query
 *         required: true
 *         description: Store name
 *     responses:
 *       200:
 *         description: Successfully retrieved distinct store routes for liquidation items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   store:
 *                     type: string
 *                     description: Distinct store name for liquidation items
 *                   location_from:
 *                     type: string
 *                     description: Distinct starting location for liquidation items
 *                   location_to:
 *                     type: string
 *                     description: Distinct ending location for liquidation items
 *                   mode_of_transportation:
 *                     type: string
 *                     description: Distinct mode of transportation for liquidation items
 *                   amount:
 *                     type: number
 *                     description: Distinct amount for liquidation items
 *                   amount_count:
 *                     type: integer
 *                     description: Count of distinct amounts for liquidation items
 *                   route_path:
 *                     type: string
 *                     description: Route path for liquidation items
 *                   usage_count:
 *                     type: integer
 *                     description: Count of usage for liquidation items
 *                   step_order:
 *                     type: integer
 *                     description: Step order for liquidation items
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation_item/getstore_routes_from:
 *   get:
 *     summary: Get store route chain starting from a specific location
 *     description: |
 *       Retrieves all connected routes for a given store starting from the specified location.
 *       The endpoint uses a recursive query to follow route connections from `li_from` to `li_to`
 *       until no further routes are found. Cyclic routes are automatically prevented.
 *     tags:
 *       - Liquidation Item
 *     parameters:
 *       - name: store_name
 *         in: query
 *         required: true
 *         description: Store name to retrieve routes from
 *         schema:
 *           type: string
 *           example: MAIN STORE
 *       - name: start_location
 *         in: query
 *         required: true
 *         description: Starting location of the route chain
 *         schema:
 *           type: string
 *           example: WAREHOUSE A
 *     responses:
 *       200:
 *         description: Successfully retrieved route chain from the specified location
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   li_from:
 *                     type: string
 *                     description: Starting location of the route segment
 *                     example: WAREHOUSE A
 *                   li_to:
 *                     type: string
 *                     description: Destination location of the route segment
 *                     example: STORE B
 *                   li_mode_of_transportation:
 *                     type: string
 *                     description: Transportation method used for the route segment
 *                     example: TRUCK
 *             example:
 *               - li_from: WAREHOUSE A
 *                 li_to: HUB 1
 *                 li_mode_of_transportation: TRUCK
 *               - li_from: HUB 1
 *                 li_to: STORE B
 *                 li_mode_of_transportation: VAN
 *               - li_from: STORE B
 *                 li_to: STORE C
 *                 li_mode_of_transportation: MOTORCYCLE
 *
 *       400:
 *         description: Missing required query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: store_name and start_location are required
 *
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation_item/update_liquidation_item:
 *   put:
 *     summary: Update liquidation item
 *     description: Update liquidation item details for a specific liquidation item.
 *     tags:
 *       - Liquidation Item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID of the liquidation item being updated
 *               particulars:
 *                 type: string
 *                 description: Item particulars
 *     responses:
 *       200:
 *         description: Successfully updated liquidation item
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

//#endregion

//#region Liquidation Activity
/**
 * @swagger
 * /liquidation_activity/getliquidation_activity:
 *   get:
 *     summary: Get all liquidation activities
 *     description: Retrieves a list of all liquidation activities with their details
 *     tags:
 *       - Liquidation Activity
 *     responses:
 *       200:
 *         description: Successfully retrieved liquidation activities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Liquidation activity ID
 *                   liquidation_id:
 *                     type: integer
 *                     description: Associated liquidation ID
 *                   action:
 *                     type: string
 *                     description: Liquidation activity action
 *                   remarks:
 *                     type: string
 *                     description: Liquidation activity remarks
 *                   receipts:
 *                     type: string
 *                     description: Liquidation activity receipts
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Liquidation activity creation date and time
 *                   created_by:
 *                     type: string
 *                     description: Liquidation activity created by
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /liquidation_activity/getliquidation_activity_by_id:
 *   get:
 *     summary: Get liquidation activity by ID
 *     description: Retrieves a specific liquidation activity by its ID
 *     tags:
 *       - Liquidation Activity
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The liquidation activity ID
 *     responses:
 *       200:
 *         description: Successfully retrieved liquidation activity
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Liquidation activity ID
 *                   liquidation_id:
 *                     type: integer
 *                     description: Associated liquidation ID
 *                   action:
 *                     type: string
 *                     description: Liquidation activity action
 *                   remarks:
 *                     type: string
 *                     description: Liquidation activity remarks
 *                   receipts:
 *                     type: string
 *                     description: Liquidation activity receipts
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Liquidation activity creation date and time
 *                   created_by:
 *                     type: string
 *                     description: Liquidation activity created by
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

//#endregion

//#region District API Documentation
/**
 * @swagger
 * /district/getdistrict:
 *   get:
 *     summary: Get all districts
 *     description: Retrieves a list of all districts with their details
 *     tags:
 *       - District
 *     responses:
 *       200:
 *         description: Successfully retrieved all district records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: District ID
 *                     example: 1
 *                   store_number:
 *                     type: string
 *                     description: Store number of the district
 *                     example: "1013"
 *                   store_name:
 *                     type: string
 *                     description: Store name
 *                     example: "BATAC CITY PROPER"
 *                   city_province:
 *                     type: string
 *                     description: City or province of the district
 *                     example: "ILOCOS NORTE"
 *                   status:
 *                     type: string
 *                     description: Store status
 *                     example: "ACTIVE"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /district/getdistrict_by_search:
 *   get:
 *     summary: Get districts by search
 *     description: Retrieves a list of districts that match the search criteria
 *     tags:
 *       - District
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: The search query
 *     responses:
 *       200:
 *         description: Successfully retrieved districts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: District ID
 *                     example: 1
 *                   store_number:
 *                     type: string
 *                     description: Store number of the district
 *                     example: "1013"
 *                   store_name:
 *                     type: string
 *                     description: Store name
 *                     example: "BATAC CITY PROPER"
 *                   city_province:
 *                     type: string
 *                     description: City or province of the district
 *                     example: "ILOCOS NORTE"
 *                   status:
 *                     type: string
 *                     description: Store status
 *                     example: "ACTIVE"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /district/getdistrict_by_id:
 *   get:
 *     summary: Get district by ID
 *     description: Retrieves a specific district record using its unique ID
 *     tags:
 *       - District
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the district
 *     responses:
 *       200:
 *         description: Successfully retrieved district by ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: District ID
 *                   example: 1
 *                 store_number:
 *                   type: string
 *                   description: Store number of the district
 *                   example: "1013"
 *                 store_name:
 *                   type: string
 *                   description: Store name
 *                   example: "BATAC CITY PROPER"
 *                 city_province:
 *                   type: string
 *                   description: City or province of the district
 *                   example: "ILOCOS NORTE"
 *                 status:
 *                   type: string
 *                   description: Store status
 *                   example: "ACTIVE"
 *       400:
 *         description: Missing or invalid district ID
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /district/download_template:
 *   get:
 *     summary: Download sample template for district import
 *     description: >
 *       Downloads a sample Excel template file that can be used as a reference for importing district records.
 *       The template includes required column headers and sample data demonstrating the proper format.
 *       Use this template to ensure your import file has the correct structure before uploading.
 *     tags:
 *       - District
 *     produces:
 *       - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 *     responses:
 *       200:
 *         description: Successfully downloaded the district import template (Excel file)
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /district/createdistrict_excel:
 *   post:
 *     summary: Import district records from Excel
 *     description: >
 *       Uploads an Excel file containing district data and inserts records into the database.
 *       The Excel file must contain the following columns: **STORE NO**, **STORE NAME**, **REGION**, **CITY PROVINCE**, and **STATUS**.
 *
 *       **To get a sample template, use the GET /district/download_template endpoint.**
 *
 *       Column Requirements:
 *       - STORE NO: Unique store identifier (required)
 *       - STORE NAME: Name of the store (required)
 *       - REGION: Region name (required)
 *       - CITY PROVINCE: City or province (required)
 *       - STATUS: Store status, default is "ACTIVE" (optional)
 *     tags:
 *       - District
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel (.xlsx) file containing district records. Download the template using GET /district/download_template for reference.
 *     responses:
 *       200:
 *         description: Successfully imported district records from Excel
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "5 store records successfully imported."
 *                 imported:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       store_no:
 *                         type: string
 *                         example: "1013"
 *                       store_name:
 *                         type: string
 *                         example: "BATAC CITY PROPER"
 *                       region:
 *                         type: string
 *                         example: "REGION 1"
 *                       city_province:
 *                         type: string
 *                         example: "ILOCOS NORTE"
 *                       status:
 *                         type: string
 *                         example: "ACTIVE"
 *       400:
 *         description: Invalid or missing file / incorrect Excel format / missing required columns
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /district/create_district:
 *   post:
 *     summary: Create a district record
 *     description: Inserts a new district record into the database.
 *     tags:
 *       - District
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_number
 *               - store_name
 *               - city_province
 *             properties:
 *               store_number:
 *                 type: string
 *                 description: Store number of the district
 *                 example: "1013"
 *               store_name:
 *                 type: string
 *                 description: Store name
 *                 example: "BATAC CITY PROPER"
 *               city_province:
 *                 type: string
 *                 description: City or province of the district
 *                 example: "ILOCOS NORTE"
 *     responses:
 *       200:
 *         description: Successfully created district record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "District created successfully."
 *                 district:
 *                   type: object
 *                   properties:
 *                     md_id:
 *                       type: integer
 *                       description: District ID
 *                       example: 1
 *                     md_store_number:
 *                       type: string
 *                       description: Store number of the district
 *                       example: "1013"
 *                     md_store_name:
 *                       type: string
 *                       description: Store name
 *                       example: "BATAC CITY PROPER"
 *                     md_city_province:
 *                       type: string
 *                       description: City or province of the district
 *                       example: "ILOCOS NORTE"
 *                     md_status:
 *                       type: string
 *                       description: Store status
 *                       example: "ACTIVE"
 *       400:
 *         description: Missing or invalid data in request body
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /district/update_district:
 *   put:
 *     summary: Update a district record
 *     description: Updates an existing district record in the database.
 *     tags:
 *       - District
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - store_number
 *               - store_name
 *               - city_province
 *             properties:
 *               id:
 *                 type: integer
 *                 description: District ID
 *                 example: 1
 *               store_number:
 *                 type: string
 *                 description: Store number of the district
 *                 example: "1013"
 *               store_name:
 *                 type: string
 *                 description: Store name
 *                 example: "BATAC CITY PROPER"
 *               city_province:
 *                 type: string
 *                 description: City or province of the district
 *                 example: "ILOCOS NORTE"
 *               status:
 *                 type: string
 *                 description: Store status
 *                 example: "ACTIVE"
 *     responses:
 *       200:
 *         description: Successfully updated district record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "District updated successfully."
 *       400:
 *         description: Missing or invalid data in request body
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

//#endregion

//#region Notification API Documentation
/**
 * @swagger
 * /notification/getnotification:
 *   get:
 *     summary: Get notification data
 *     tags: [Notification]
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         required: true
 *         description: The user type (Requester, Team Leader, Finance, Administrator, Custodian)
 *     responses:
 *       200:
 *         description: Successfully retrieved notification data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pending_cash_request_result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CashRequest'
 *                 approved_cash_request_result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CashRequest'
 *                 completed_cash_request_result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CashRequest'
 *                 rejected_cash_request_result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CashRequest'
 *                 pending_liquidation_result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Liquidation'
 *                 approved_liquidation_result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Liquidation'
 *                 verified_liquidation_result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Liquidation'
 *                 completed_liquidation_result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Liquidation'
 *                 incomplete_liquidation_result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Liquidation'
 *                 rejected_liquidation_result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Liquidation'
 */

//#endregion

/**
 * @swagger
 * components:
 *   schemas:
 *     RedFlag:
 *       type: object
 *       properties:
 *         rf_id:
 *           type: integer
 *         rf_liquidation_id:
 *           type: integer
 *         rf_liquidation_item_id:
 *           type: integer
 *         rf_from:
 *           type: string
 *         rf_to:
 *           type: string
 *         rf_mode_of_transportation:
 *           type: string
 *           maxLength: 300
 *         rf_min_amount:
 *           type: number
 *         rf_max_amount:
 *           type: number
 *         rf_amount:
 *           type: number
 *         rf_created_by:
 *           type: string
 *           maxLength: 300
 *         rf_created_date:
 *           type: string
 *           maxLength: 20
 */

//#region Red Flags API Documentation

/**
 * @swagger
 * /red_flags/getred_flags:
 *   get:
 *     summary: Get red flags data
 *     tags: [Red Flags]
 *     responses:
 *       200:
 *         description: Successfully retrieved red flags data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 red_flags_result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RedFlag'
 */

/**
 * @swagger
 * /red_flags/getred_flags_by_search:
 *   get:
 *     summary: Get red flags data by search
 *     tags: [Red Flags]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit for pagination
 *     responses:
 *       200:
 *         description: Successfully retrieved red flags data by search
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 red_flags_result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RedFlag'
 */

/**
 * @swagger
 * /red_flags/update_red_flags_approval:
 *   put:
 *     summary: Update red flags approval status
 *     tags: [Red Flags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: ["PENDING", "APPLIED", "REJECTED"]
 *               updated_by:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated red flags approval status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

//#endregion

//#region Mode of Transportation API Documentation

/**
 * @swagger
 * /mode_of_transportation/getmode_of_transportation:
 *   get:
 *     summary: Get mode of transportation data
 *     tags: [Mode of Transportation]
 *     parameters:
 *       - in: query
 *         name: searchValue
 *         schema:
 *           type: string
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved mode of transportation data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mode_of_transportation_result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ModeOfTransportation'
 *                 totalCount:
 *                   type: integer
 */

/**
 * @swagger
 * /mode_of_transportation/update_mode_of_transportation:
 *   put:
 *     summary: Update mode of transportation data
 *     tags: [Mode of Transportation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: ["ACTIVE", "INACTIVE"]
 *     responses:
 *       200:
 *         description: Successfully updated mode of transportation data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /mode_of_transportation/create_mode_of_transporation:
 *   post:
 *     summary: Create mode of transportation
 *     tags: [Mode of Transportation]
 *     requestBody:
 *       description: Mode of transportation data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the mode of transportation
 *                 example: "Taxi"
 *     responses:
 *       200:
 *         description: Successfully created mode of transportation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

//#endregion

//#region Purpose API Documentation
/**
 * @swagger
 * /purpose/getpurpose:
 *   get:
 *     summary: Get purpose data
 *     tags: [Purpose]
 *     parameters:
 *       - in: query
 *         name: searchValue
 *         schema:
 *           type: string
 *         description: Search query for filtering purposes
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit for pagination
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Status for filtering purposes
 *     responses:
 *       200:
 *         description: Successfully retrieved purpose data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 purpose_result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Purpose'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /purpose/update_purpose:
 *   put:
 *     summary: Update purpose data
 *     tags: [Purpose]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: ["ACTIVE", "INACTIVE"]
 *     responses:
 *       200:
 *         description: Successfully updated purpose data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /purpose/create_purpose:
 *   post:
 *     summary: Create a new purpose
 *     tags: [Purpose]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully created purpose
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

//#endregion

//#region Reporting
/**
 * @swagger
 * /reporting/get_region_city_province:
 *   get:
 *     summary: Get region and city/province statistics
 *     description: Retrieves aggregated statistics for liquidation items grouped by region and city/province
 *     tags:
 *       - Reporting
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully retrieved region and city/province data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   region:
 *                     type: string
 *                     description: Region name
 *                     example: "REGION I"
 *                   city_province:
 *                     type: string
 *                     description: City or province name
 *                     example: "ILOCOS NORTE"
 *                   city_item_count:
 *                     type: integer
 *                     description: Count of items in the city/province
 *                     example: 25
 *                   city_total_amount:
 *                     type: number
 *                     description: Total amount for the city/province
 *                     example: 15000.50
 *                   region_item_count:
 *                     type: integer
 *                     description: Count of items in the region
 *                     example: 100
 *                   region_total_amount:
 *                     type: number
 *                     description: Total amount for the region
 *                     example: 75000.00
 *                   overall_item_count:
 *                     type: integer
 *                     description: Overall count of all items
 *                     example: 500
 *                   overall_total_amount:
 *                     type: number
 *                     description: Overall total amount
 *                     example: 250000.00
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

//#endregion
