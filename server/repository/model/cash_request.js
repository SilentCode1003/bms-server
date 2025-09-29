const CashRequests = {
    cash_request: {
        tablename: "cash_request",
        prefix: "cr_",
        insertColumns: [
            "reference_id",
            "cv_number",
            "description",
            "team_lead",
            "employee",
            "employee_id",
            "department",
            "position",
            "amount",
            "request_date",
            "status"
        ],
        selectColumns: [
            "cr_id",
            "cr_reference_id",
            "cr_cv_number",
            "cr_description",
            "cr_team_lead",
            "cr_employee",
            "cr_employee_id",
            "cr_department",
            "cr_position",
            "cr_amount",
            "cr_request_date",
            "cr_status"
        ],
        selectOptionsColumn: {
            id: "cr_id",
            reference_id: "cr_reference_id",
            cv_number: "cr_cv_number",
            description: "cr_description",
            team_lead: "cr_team_lead",
            employee: "cr_employee",
            employee_id: "cr_employee_id",
            department: "cr_department",
            position: "cr_position",
            amount: "cr_amount",
            request_date: "cr_request_date",
            status: "cr_status"
        }
    },
    cash_request_activity: {
        tablename: "cash_request_activity",
        prefix: "cra_",
        insertColumns: [
            "cash_request_id",
            "action",
            "remarks",
            "created_at",
            "requested_by"
        ],
        selectColumns: [
            "cra_id",
            "cra_cash_request_id",
            "cra_action",
            "cra_remarks",
            "cra_created_at",
            "cra_requested_by"
        ],
        selectOptionsColumn: {
            id: "cra_id",
            cash_request_id: "cra_cash_request_id",
            action: "cra_action",
            remarks: "cra_remarks",
            created_at: "cra_created_at",
            requested_by: "cra_requested_by"
        }
    }
};

module.exports = { CashRequests };
