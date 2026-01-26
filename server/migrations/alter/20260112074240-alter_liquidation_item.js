'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('liquidation_item', 'li_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'li_particulars'
    });
    await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS liquidation_item_AFTER_INSERT;
`);

    await queryInterface.sequelize.query(`
    CREATE TRIGGER liquidation_item_AFTER_INSERT AFTER INSERT ON liquidation_item FOR EACH ROW BEGIN
        DECLARE v_count INT DEFAULT 0;
        DECLARE v_min DECIMAL(10,2) DEFAULT 0.00;
        DECLARE v_max DECIMAL(10,2) DEFAULT 0.00;
        DECLARE v_master_min DECIMAL(10,2) DEFAULT NULL;
        DECLARE v_master_max DECIMAL(10,2) DEFAULT NULL;
        DECLARE v_master_exists INT DEFAULT 0;
        DECLARE v_prepared_by VARCHAR(300) DEFAULT 'system-trigger';

        SELECT COUNT(DISTINCT li_amount),
               MIN(li_amount),
               MAX(li_amount)
        INTO v_count, v_min, v_max
        FROM liquidation_item
        WHERE li_from = NEW.li_from
          AND li_to = NEW.li_to;

        SELECT COUNT(*)
        INTO v_master_exists
        FROM master_min_max
        WHERE mmm_from = NEW.li_from
          AND mmm_to = NEW.li_to;

        IF v_count >= 3 AND v_master_exists = 0 THEN
            INSERT INTO master_min_max (
                mmm_from, mmm_to, mmm_mode_of_transportation, mmm_min_amount, mmm_max_amount
            )
            VALUES (
                NEW.li_from, NEW.li_to, NEW.li_mode_of_transportation, v_min, v_max
            );
            SET v_master_exists = 1;
            SET v_master_min = v_min;
            SET v_master_max = v_max;
        END IF;

        IF v_master_exists = 1 THEN
            SELECT mmm_min_amount, mmm_max_amount
            INTO v_master_min, v_master_max
            FROM master_min_max
            WHERE mmm_from = NEW.li_from
              AND mmm_to = NEW.li_to
            LIMIT 1;

            SELECT lia_created_by
            INTO v_prepared_by
            FROM liquidation_activity
            WHERE lia_liquidation_id = NEW.li_liquidation_id
              AND lia_action = 'PREPARED'
            ORDER BY lia_id DESC
            LIMIT 1;

            IF v_master_min IS NOT NULL AND v_master_max IS NOT NULL THEN
                IF NEW.li_amount < v_master_min THEN
                    INSERT INTO red_flags (
                        rf_liquidation_id,
                        rf_liquidation_item_id,
                        rf_from,
                        rf_to,
                        rf_mode_of_transportation,
                        rf_min_amount,
                        rf_max_amount,
                        rf_amount,
                        rf_created_by,
                        rf_created_date,
                        rf_status,
                        rf_approval_status
                    )
                    VALUES (
                        NEW.li_liquidation_id,
                        NEW.li_id,
                        NEW.li_from,
                        NEW.li_to,
                        NEW.li_mode_of_transportation,
                        v_master_min,
                        v_master_max,
                        NEW.li_amount,
                        v_prepared_by,
                        DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'),
                        'MINIMUM',
                        'PENDING'
                    );
                ELSEIF NEW.li_amount > v_master_max THEN
                    INSERT INTO red_flags (
                        rf_liquidation_id,
                        rf_liquidation_item_id,
                        rf_from,
                        rf_to,
                        rf_mode_of_transportation,
                        rf_min_amount,
                        rf_max_amount,
                        rf_amount,
                        rf_created_by,
                        rf_created_date,
                        rf_status,
                        rf_approval_status
                    )
                    VALUES (
                        NEW.li_liquidation_id,
                        NEW.li_id,
                        NEW.li_from,
                        NEW.li_to,
                        NEW.li_mode_of_transportation,
                        v_master_min,
                        v_master_max,
                        NEW.li_amount,
                        v_prepared_by,
                        DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'),
                        'MAXIMUM',
                        'PENDING'
                    );
                END IF;
            END IF;

        END IF;

    END
`);

    await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS liquidation_item_UPDATE_INSERT;
`);

    await queryInterface.sequelize.query(`
    CREATE TRIGGER liquidation_item_UPDATE_INSERT AFTER UPDATE ON liquidation_item FOR EACH ROW BEGIN
        DECLARE v_count INT DEFAULT 0;
        DECLARE v_min DECIMAL(10,2) DEFAULT 0.00;
        DECLARE v_max DECIMAL(10,2) DEFAULT 0.00;
        DECLARE v_master_min DECIMAL(10,2) DEFAULT NULL;
        DECLARE v_master_max DECIMAL(10,2) DEFAULT NULL;
        DECLARE v_master_exists INT DEFAULT 0;
        DECLARE v_prepared_by VARCHAR(300) DEFAULT 'system-trigger';

        SELECT COUNT(DISTINCT li_amount),
               MIN(li_amount),
               MAX(li_amount)
        INTO v_count, v_min, v_max
        FROM liquidation_item
        WHERE li_from = NEW.li_from
          AND li_to = NEW.li_to;

        SELECT COUNT(*)
        INTO v_master_exists
        FROM master_min_max
        WHERE mmm_from = NEW.li_from
          AND mmm_to = NEW.li_to;

        IF v_count >= 3 AND v_master_exists = 0 THEN
            INSERT INTO master_min_max (
                mmm_from, mmm_to, mmm_mode_of_transportation, mmm_min_amount, mmm_max_amount
            )
            VALUES (
                NEW.li_from, NEW.li_to, NEW.li_mode_of_transportation, v_min, v_max
            );
            SET v_master_exists = 1;
            SET v_master_min = v_min;
            SET v_master_max = v_max;
        END IF;

        IF v_master_exists = 1 THEN
            SELECT mmm_min_amount, mmm_max_amount
            INTO v_master_min, v_master_max
            FROM master_min_max
            WHERE mmm_from = NEW.li_from
              AND mmm_to = NEW.li_to
            LIMIT 1;

            SELECT lia_created_by
            INTO v_prepared_by
            FROM liquidation_activity
            WHERE lia_liquidation_id = NEW.li_liquidation_id
              AND lia_action = 'PREPARED'
            ORDER BY lia_id DESC
            LIMIT 1;

            IF v_master_min IS NOT NULL AND v_master_max IS NOT NULL THEN
                IF NEW.li_amount < v_master_min THEN
                    INSERT INTO red_flags (
                        rf_liquidation_id,
                        rf_liquidation_item_id,
                        rf_from,
                        rf_to,
                        rf_mode_of_transportation,
                        rf_min_amount,
                        rf_max_amount,
                        rf_amount,
                        rf_created_by,
                        rf_created_date,
                        rf_status,
                        rf_approval_status
                    )
                    VALUES (
                        NEW.li_liquidation_id,
                        NEW.li_id,
                        NEW.li_from,
                        NEW.li_to,
                        NEW.li_mode_of_transportation,
                        v_master_min,
                        v_master_max,
                        NEW.li_amount,
                        v_prepared_by,
                        DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'),
                        'MINIMUM',
                        'PENDING'
                    );
                ELSEIF NEW.li_amount > v_master_max THEN
                    INSERT INTO red_flags (
                        rf_liquidation_id,
                        rf_liquidation_item_id,
                        rf_from,
                        rf_to,
                        rf_mode_of_transportation,
                        rf_min_amount,
                        rf_max_amount,
                        rf_amount,
                        rf_created_by,
                        rf_created_date,
                        rf_status,
                        rf_approval_status
                    )
                    VALUES (
                        NEW.li_liquidation_id,
                        NEW.li_id,
                        NEW.li_from,
                        NEW.li_to,
                        NEW.li_mode_of_transportation,
                        v_master_min,
                        v_master_max,
                        NEW.li_amount,
                        v_prepared_by,
                        DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'),
                        'MAXIMUM',
                        'PENDING'
                    );
                END IF;
            END IF;

        END IF;

    END
`);


  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
