-- =============================================================================
--  IAT Technologies – Intranet Portal
--  Database Schema (Full)
--  Engine : MySQL 8.x  |  Charset : utf8mb4 / utf8mb4_unicode_ci
--
--  Table creation order (respects foreign-key dependencies):
--    1.  users
--    2.  sessions
--    3.  password_resets
--    4.  attendance_logs
--    5.  events
--    6.  event_images
--    7.  announcements
--    8.  ideas
--    9.  idea_likes
--   10.  idea_comments
--   11.  hr_policies
--   12.  holidays
--   13.  thoughts
-- =============================================================================

CREATE DATABASE IF NOT EXISTS intranet_portal
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE intranet_portal;

-- =============================================================================
-- 1. USERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id            INT           NOT NULL AUTO_INCREMENT,
    employee_id   VARCHAR(50)   DEFAULT NULL,
    email         VARCHAR(255)  NOT NULL,
    password      VARCHAR(255)  NOT NULL,
    first_name    VARCHAR(100)  NOT NULL,
    last_name     VARCHAR(100)  NOT NULL,
    role          ENUM('superadmin','admin','employee') NOT NULL DEFAULT 'employee',
    branch        ENUM('Guindy','Nungambakkam')         DEFAULT NULL,
    department    VARCHAR(100)  DEFAULT NULL,
    position      VARCHAR(100)  DEFAULT NULL,
    birth_date    DATE          DEFAULT NULL,
    phone         VARCHAR(20)   DEFAULT NULL,
    status        ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
    last_login    DATETIME      DEFAULT NULL,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE  KEY uq_email       (email),
    UNIQUE  KEY uq_employee_id (employee_id),
    INDEX   idx_role           (role),
    INDEX   idx_status         (status),
    INDEX   idx_branch         (branch),
    INDEX   idx_birth_date     (birth_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. SESSIONS  (active JWT / session tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS sessions (
    id          INT           NOT NULL AUTO_INCREMENT,
    user_id     INT           NOT NULL,
    token       VARCHAR(500)  NOT NULL,
    ip_address  VARCHAR(45)   DEFAULT NULL,
    user_agent  TEXT          DEFAULT NULL,
    expires_at  DATETIME      NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_user_id   (user_id),
    INDEX idx_token     (token(255)),
    INDEX idx_expires   (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. PASSWORD RESETS
-- =============================================================================
CREATE TABLE IF NOT EXISTS password_resets (
    id          INT           NOT NULL AUTO_INCREMENT,
    user_id     INT           NOT NULL,
    token       VARCHAR(255)  NOT NULL,
    expires_at  DATETIME      NOT NULL,
    used        TINYINT(1)    NOT NULL DEFAULT 0,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_token   (token),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. ATTENDANCE LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS attendance_logs (
    id                  INT             NOT NULL AUTO_INCREMENT,
    user_id             INT             NOT NULL,
    date                DATE            NOT NULL,
    check_in            DATETIME        NOT NULL,
    check_out           DATETIME        DEFAULT NULL,
    check_in_remarks    TEXT            DEFAULT NULL,
    check_out_remarks   TEXT            DEFAULT NULL,
    status              ENUM('active','completed') NOT NULL DEFAULT 'active',
    duration_minutes    DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_user_id (user_id),
    INDEX idx_date    (date),
    INDEX idx_status  (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. EVENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS events (
    id          INT           NOT NULL AUTO_INCREMENT,
    title       VARCHAR(255)  NOT NULL,
    description TEXT          DEFAULT NULL,
    event_date  DATE          NOT NULL,
    event_time  VARCHAR(50)   DEFAULT NULL,
    location    VARCHAR(255)  DEFAULT NULL,
    cover_index INT           NOT NULL DEFAULT 0,
    created_by  INT           NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_event_date  (event_date),
    INDEX idx_created_by  (created_by),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 6. EVENT IMAGES
-- =============================================================================
CREATE TABLE IF NOT EXISTS event_images (
    id          INT           NOT NULL AUTO_INCREMENT,
    event_id    INT           NOT NULL,
    image_url   VARCHAR(500)  NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_event_id (event_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 7. ANNOUNCEMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS announcements (
    id          INT           NOT NULL AUTO_INCREMENT,
    title       VARCHAR(255)  NOT NULL,
    content     TEXT          NOT NULL,
    priority    ENUM('Normal','High','Urgent') NOT NULL DEFAULT 'Normal',
    created_by  INT           DEFAULT NULL,
    publish_at  DATETIME      DEFAULT NULL,
    expiry_at   DATETIME      DEFAULT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_created_by (created_by),
    INDEX idx_priority   (priority),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 8. IDEAS
-- =============================================================================
CREATE TABLE IF NOT EXISTS ideas (
    id          INT           NOT NULL AUTO_INCREMENT,
    user_id     INT           NOT NULL,
    title       VARCHAR(255)  NOT NULL,
    content     TEXT          NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_user_id   (user_id),
    INDEX idx_created_at(created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 9. IDEA LIKES
-- =============================================================================
CREATE TABLE IF NOT EXISTS idea_likes (
    id          INT       NOT NULL AUTO_INCREMENT,
    idea_id     INT       NOT NULL,
    user_id     INT       NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_like (idea_id, user_id),
    FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 10. IDEA COMMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS idea_comments (
    id          INT       NOT NULL AUTO_INCREMENT,
    idea_id     INT       NOT NULL,
    user_id     INT       NOT NULL,
    comment     TEXT      NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_idea_id (idea_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 11. HR POLICIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS hr_policies (
    id              INT           NOT NULL AUTO_INCREMENT,
    title           VARCHAR(255)  DEFAULT NULL,
    category        VARCHAR(255)  DEFAULT NULL,
    description     TEXT          DEFAULT NULL,
    content         TEXT          DEFAULT NULL,
    doc_no          VARCHAR(255)  DEFAULT NULL,
    version         VARCHAR(255)  DEFAULT NULL,
    effective_date  DATETIME      DEFAULT NULL,
    prepared_by     VARCHAR(255)  DEFAULT NULL,
    approved_by     VARCHAR(255)  DEFAULT NULL,
    status          VARCHAR(255)  DEFAULT NULL,
    created_by      INT           DEFAULT NULL,
    createdAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_category   (category),
    INDEX idx_created_by (created_by),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 12. HOLIDAYS
-- =============================================================================
CREATE TABLE IF NOT EXISTS holidays (
    id          INT           NOT NULL AUTO_INCREMENT,
    name        VARCHAR(255)  NOT NULL,
    date        DATE          NOT NULL,
    description TEXT          DEFAULT NULL,
    branch      VARCHAR(100)  NOT NULL,
    created_by  INT           NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_branch     (branch),
    INDEX idx_date       (date),
    INDEX idx_created_by (created_by),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 13. THOUGHTS OF THE DAY
-- =============================================================================
CREATE TABLE IF NOT EXISTS thoughts (
    id          INT           NOT NULL AUTO_INCREMENT,
    content     TEXT          NOT NULL,
    author      VARCHAR(255)  NOT NULL,
    branch      VARCHAR(50)   NOT NULL,
    created_by  INT           NOT NULL,
    is_active   TINYINT(1)    NOT NULL DEFAULT 1,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_branch     (branch),
    INDEX idx_is_active  (is_active),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- SEED DATA
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Superadmin (no branch – access to all branches)
-- Login: superadmin@iattechnologies.com / superadmin123
-- NOTE: Password is plain-text here for initial setup.
--       The application hashes passwords with bcrypt on first-use / via seeder.
-- -----------------------------------------------------------------------------
INSERT INTO users
    (employee_id, email, password, first_name, last_name, role, branch, department, position, status, birth_date)
VALUES
    ('SA001', 'superadmin@iattechnologies.com', 'superadmin123',
     'Super', 'Admin', 'superadmin', NULL, 'Management', 'Director', 'active', '1980-01-01');

-- -----------------------------------------------------------------------------
-- Admin – Guindy branch
-- Login: admin.guindy@iattechnologies.com / admin123
-- -----------------------------------------------------------------------------
INSERT INTO users
    (employee_id, email, password, first_name, last_name, role, branch, department, position, status, birth_date)
VALUES
    ('ADM001', 'admin.guindy@iattechnologies.com', 'admin123',
     'Guindy', 'Admin', 'admin', 'Guindy', 'Operations', 'Branch Manager', 'active', '1985-06-15');

-- -----------------------------------------------------------------------------
-- Admin – Nungambakkam branch
-- Login: admin.nungambakkam@iattechnologies.com / admin123
-- -----------------------------------------------------------------------------
INSERT INTO users
    (employee_id, email, password, first_name, last_name, role, branch, department, position, status, birth_date)
VALUES
    ('ADM002', 'admin.nungambakkam@iattechnologies.com', 'admin123',
     'Nungambakkam', 'Admin', 'admin', 'Nungambakkam', 'Operations', 'Branch Manager', 'active', '1988-03-22');




-- -- -----------------------------------------------------------------------------
-- -- Sample Employee – Guindy branch
-- -- Login: employee.guindy@iattechnologies.com / employee123
-- -- -----------------------------------------------------------------------------
-- INSERT INTO users
--     (employee_id, email, password, first_name, last_name, role, branch, department, position, status, birth_date)
-- VALUES
--     ('EMP001', 'employee.guindy@iattechnologies.com', 'employee123',
--      'John', 'Doe', 'employee', 'Guindy', 'Development', 'Software Engineer', 'active', '1995-08-10');

-- -- -----------------------------------------------------------------------------
-- -- Sample Thoughts of the Day
-- -- (created_by = 1 → Superadmin SA001)
-- -- -----------------------------------------------------------------------------
-- INSERT INTO thoughts (content, author, branch, created_by, is_active) VALUES
-- ('Success is not final, failure is not fatal: it is the courage to continue that counts.',
--  'Winston Churchill', 'Guindy', 1, 1),
-- ('The only way to do great work is to love what you do.',
--  'Steve Jobs', 'Nungambakkam', 1, 1),
-- ('Innovation distinguishes between a leader and a follower.',
--  'Steve Jobs', 'Guindy', 1, 1);
