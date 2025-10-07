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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          in: "header",
          name: "Authorization"
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'An error occurred'
            },
            error: {
              type: 'object',
              properties: {
                status: {
                  type: 'integer',
                  example: 500
                },
                message: {
                  type: 'string',
                  example: 'Internal Server Error'
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    // Allow CORS for token usage across different origins
    responses: {
      UnauthorizedError: {
        description: 'Unauthorized - Invalid or missing token',
        headers: {
          'Access-Control-Allow-Origin': { 
            schema: { 
              type: 'string',
              default: '*' 
            } 
          },
          'Access-Control-Allow-Credentials': { 
            schema: { 
              type: 'boolean',
              default: true 
            } 
          }
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization'
      }
    },
    servers: [
      {
        url: "http://localhost:5012",
        description: "Localhost"
      },
      {
        url: "http://192.168.40.43:5012",
        description: "Staging Server"
      },
      {
        url: "http://192.168.40.43:5012",
        description: "Development Server"
      },
      {
        url: "http://192.168.40.43:5012",
        description: "Auth Server"
      }
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
 *       - url: http://192.168.40.43:5000
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
 *                     fetch('http://localhost:5012/api/endpoint', {
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
 *                 example: 4800
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
 *                   required:
 *                     - id
 *                     - date
 *                     - particulars
 *                     - amount
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Liquidation item ID
 *                     date:
 *                       type: string
 *                       description: Date of liquidation item
 *                     rt:
 *                       type: string
 *                       description: RT reference
 *                     store_name:
 *                       type: string
 *                       description: Store name
 *                     particulars:
 *                       type: string
 *                       description: Item particulars
 *                     from:
 *                       type: string
 *                       description: Travel origin
 *                     to:
 *                       type: string
 *                       description: Travel destination
 *                     mode_of_transportation:
 *                       type: string
 *                       description: Mode of transportation
 *                     amount:
 *                       type: number
 *                       format: float
 *                       description: Item amount
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
 * /liquidation/update_liquidation:
 *   put:
 *     summary: Update cash liquidation
 *     description: Update a cash liquidation
 *     tags:
 *       - Liquidation
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Cash liquidation data
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: ["APPROVED", "VERIFIED", "COMPLETED", "REJECTED"]
 *             id:
 *               type: integer
 *             remarks:
 *               type: string
 *             receipts:
 *               type: string
 *             created_by:
 *               type: integer
 *     responses:
 *       200:
 *         description: Successfully updated cash liquidation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   enum: [SUCCESS]
 *       400:
 *         description: Bad Request
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


//#endregion

