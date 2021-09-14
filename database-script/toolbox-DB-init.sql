USE [1086088]
GO
-- will use prefix 'toolbox' to all table names

-- ### ### ### ### this part was originally loginDB

-- --------------------------------------------
-- --Dropping constraints and tables (reset) --
-- --------------------------------------------

-- Table: toolboxPassword
-- Constraint: FK_toolboxPassword_toolboxUser
ALTER TABLE toolboxPassword
DROP CONSTRAINT IF EXISTS FK_toolboxPassword_toolboxUser
GO

-- Table: toolboxUser
-- Constraint: FK_toolboxUser_toolboxRole
ALTER TABLE toolboxUser
DROP CONSTRAINT IF EXISTS FK_toolboxUser_toolboxRole
GO

-- Table: toolboxUser
-- Constraint: FK_toolboxUser_toolboxRole
ALTER TABLE toolboxTool
DROP CONSTRAINT IF EXISTS FK_toolboxUser_toolboxTool
GO

ALTER TABLE toolboxTool
DROP CONSTRAINT IF EXISTS FK_toolboxCategory_toolboxTool
GO


-- -----------------------
-- Dropping TABLE --
-- -----------------------

-- Table: toolboxUser
DROP TABLE IF EXISTS toolboxUser
GO

-- Table: toolboxRole
DROP TABLE if EXISTS toolboxRole
GO

-- Table: toolboxRole
DROP TABLE if EXISTS toolboxCategory
GO

-- Table: toolboxRole
DROP TABLE if EXISTS toolboxTool
GO

-- Table: toolboxPassword
DROP TABLE IF EXISTS toolboxPassword
GO

-- end of: dropping constraints and tables


-- Create Tables
    -- toolboxRole
    -- toolboxUser
    -- toolboxPassword
    -- toolboxCategory

CREATE TABLE toolboxRole
(
    roleId INT NOT NULL IDENTITY PRIMARY KEY,
    roleName NVARCHAR(50) NOT NULL,
    roleDescription NVARCHAR(255)
)
GO

CREATE TABLE toolboxUser
(
    userId INT NOT NULL IDENTITY PRIMARY KEY,
    userName NVARCHAR(50) NOT NULL,
    userEmail NVARCHAR(255) NOT NULL,
    FK_roleId INT NOT NULL,

    CONSTRAINT FK_toolboxUser_toolboxRole FOREIGN KEY (FK_roleid) REFERENCES toolboxRole (roleid)
)
GO
-- Table: toolboxTool
CREATE TABLE toolboxCategory
(
    categoryId INT NOT NULL IDENTITY PRIMARY KEY,
    categoryValue NVARCHAR(50) NOT NULL
);
GO

CREATE TABLE toolboxPassword
(
    passwordValue NVARCHAR(255) NOT NULL,
    FK_userId INT NOT NULL,

    CONSTRAINT FK_toolboxPassword_toolboxUser FOREIGN KEY (FK_userId) REFERENCES toolboxUser (userId)
)

GO
-- Table: toolboxTool
CREATE TABLE toolboxTool
(
    toolId INT NOT NULL IDENTITY PRIMARY KEY,
    toolTitle NVARCHAR(50) NOT NULL,
    toolContent NVARCHAR(128) NOT NULL,
    toolLink NVARCHAR(255) NOT NULL,
    FK_userId INT NOT NULL,
    FK_categoryId INT NOT NULL,

    CONSTRAINT FK_toolboxUser_toolboxTool FOREIGN KEY (FK_userId) REFERENCES toolboxUser (userId),
    CONSTRAINT FK_toolboxCategory_toolboxTool FOREIGN KEY (FK_categoryId) REFERENCES toolboxCategory (categoryId)
);
GO


-- --------------------------------
-- Populating the DB with test data
-- --------------------------------

-- Role
INSERT INTO toolboxRole
    ([roleName], [roleDescription])
VALUES
    ('Admin', 'Can do everything!'),
    ('Member', 'Can do most stuff!')
GO

-- User
-- User INFO:
-- admin@admin.com, password: admin
-- member@member.com, password: member

INSERT INTO toolboxUser
    ([userName], [userEmail], [FK_roleId])
VALUES
    ('Admin', 'admin@admin.com', 1),
    ('Member', 'member@member.com', 2)
GO

-- Password
INSERT INTO toolboxPassword
    ([passwordValue], [FK_userId])
VALUES
    ('admin', 1),
    ('member', 2)
GO

-- Tools
-- INSERT INTO toolboxTool
--     ([toolTitle], [toolContent], [toolLink], [FK_userId], [FK_categoryId])
-- VALUES
--     ('Type Scale', 'A tool to have better scales between font sizes', 'https://type-scale.com/', 1, 1),
--     ('React', 'JavaScript framework :)', 'https://reactjs.org/', 1, 3)
-- GO
INSERT INTO toolboxTool
    ([toolTitle])
VALUES
    ('yay!')
GO

-- Categories
INSERT INTO toolboxCategory
    ([categoryValue])
VALUES
    ('Design'),
    ('UserExperience'),
    ('FrontEnd'),
    ('BackEnd')
GO

-- --------------------------------
-- ------ End of test data --------
-- --------------------------------

-- ----------------------
-- ---- Quick Test ------
-- ----------------------
SELECT *
FROM toolboxTool
GO

SELECT *
FROM toolboxUser
GO

SELECT *
FROM toolboxPassword
GO

SELECT *
FROM toolboxCategory
GO
