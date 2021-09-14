USE [1086088]
GO
-- will use prefix 'toolbox' to all table names

-- ### ### ### ### this part was originally loginDB

-- --------------------------------------------
-- --Dropping constraints and tables (reset) --
-- --------------------------------------------

-- Table: toolboxPassword
-- Constraint: FK_toolboxPassword_toolboxUser
ALTER TABLE dbo.toolboxPassword
DROP CONSTRAINT IF EXISTS FK_toolboxPassword_toolboxUser
GO

-- Table: toolboxUser
-- Constraint: FK_toolboxUser_toolboxRole
ALTER TABLE dbo.toolboxUser
DROP CONSTRAINT IF EXISTS FK_toolboxUser_toolboxRole
GO

-- Drop the table if it already exists
-- Table: toolboxPassword
DROP TABLE IF EXISTS dbo.toolboxPassword
GO

-- Table: toolboxUser
-- Constraint: FK_toolboxUser_toolboxRole
ALTER TABLE dbo.toolboxTool
DROP CONSTRAINT IF EXISTS FK_user_tool
GO

ALTER TABLE dbo.toolboxTool
DROP CONSTRAINT IF EXISTS FK_category_tool
GO






-- Drop the table if it already exists
-- Table: toolboxUser
DROP TABLE IF EXISTS dbo.toolboxUser
GO

-- Drop the table if it already exists
-- Table: toolboxRole
DROP TABLE if EXISTS dbo.toolboxRole
GO



-- Drop the table if it already exists
-- Table: toolboxRole
DROP TABLE if EXISTS dbo.toolboxCategory
GO

-- Drop the table if it already exists
-- Table: toolboxRole
DROP TABLE if EXISTS dbo.toolboxTool

GO
-- end of: dropping constraints and tables


-- *** *** *** ***
-- creating tables: toolboxRole, toolboxUser, toolboxPassword
-- *** *** *** ***
CREATE TABLE toolboxRole
(
    roleid INT IDENTITY NOT NULL PRIMARY KEY,
    roleName NVARCHAR(50) NOT NULL,
    roleDescription NVARCHAR(255)
)
GO

CREATE TABLE toolboxUser
(
    userId INT IDENTITY NOT NULL PRIMARY KEY,
    userName NVARCHAR(50) NOT NULL,
    userEmail NVARCHAR(255) NOT NULL,
    FK_roleid INT NOT NULL,

    CONSTRAINT FK_toolboxUser_toolboxRole FOREIGN KEY (FK_roleid) REFERENCES toolboxRole (roleid)
)
GO

CREATE TABLE toolboxPassword
(
    passwordValue NVARCHAR(255) NOT NULL,
    FK_userId INT NOT NULL,

    CONSTRAINT FK_toolboxPassword_toolboxUser FOREIGN KEY (FK_userId) REFERENCES toolboxUser (userId)
)
GO
-- end of: creating tables


-- end of: populating tables with test data

-- *** *** *** ***
-- quick test
-- *** *** *** ***
SELECT *
FROM toolboxRole
GO

SELECT *
FROM toolboxUser
GO

SELECT *
FROM toolboxPassword
GO

-- end of: quick test

-- ### ### ### ### END: this part was originally loginDB

-- ### ### ### ### this part was originally libexDB in wad-library-...

-- Drop the table if it already exists
-- Table: toolboxTool
DROP TABLE IF EXISTS dbo.toolboxTool
GO

-- Drop the table if it already exists
-- Table: toolboxTool
DROP TABLE IF EXISTS dbo.toolboxCategory
GO

-- Creating the table(s)
-- Table: toolboxTool
CREATE TABLE dbo.toolboxCategory
(
    categoryid INT NOT NULL IDENTITY PRIMARY KEY,
    -- primary key column
    category NVARCHAR(50) NOT NULL
);
GO
-- Table: toolboxTool
CREATE TABLE dbo.toolboxTool
(
    toolid INT NOT NULL IDENTITY PRIMARY KEY,
    -- primary key column
    title NVARCHAR(50) NOT NULL,
    content NVARCHAR(128),
    link NVARCHAR(255),
    FK_userid INT NOT NULL,
    FK_categoryid INT NOT NULL,

    CONSTRAINT FK_user_tool FOREIGN KEY (FK_userid) REFERENCES toolboxUser (userid),
    CONSTRAINT FK_category_tool FOREIGN KEY (FK_categoryid) REFERENCES toolboxCategory (categoryid)
);
GO


-- --------------------------------
-- Populating the DB with test data
-- --------------------------------

-- Role
INSERT INTO toolboxRole
    (roleName, roleDescription)
VALUES
    ('admin', 'can do whatever'),
    ('member', 'can do stuff that is allowed')
GO

-- User
-- User INFO:
-- admin@admin.com, password: admin
-- member@member.com, password: member

INSERT INTO toolboxUser
    (userName, userEmail, FK_roleid)
VALUES
    ('admin', 'admin@admin.com', 1),
    ('member', 'member@member.com', 2)
GO

-- Password
INSERT INTO toolboxPassword
    (passwordValue, FK_userId)
VALUES
    ('admin', 1),
    ('member', 2)
GO

-- Tools
-- INSERT INTO toolboxTool
--     (title, content, link, FK_userid, FK_categoryid)
-- VALUES
--     ("Type Scale", "A tool to have better scales between font sizes", "https://type-scale.com/", 1, 1),
--     ("React", "JavaScript framework :)", "https://reactjs.org/", 1, 3)
-- GO

-- -- Categories
-- INSERT INTO toolboxCategory
--     (categoryid, category)
-- VALUES
--     (1 ,"design"),
--     (2, "userExperience"),
--     (3, "frontend"),
--     (4, "backend")
-- GO

-- --------------------------------
-- ------ End of test data --------
-- --------------------------------

-- ----------------------
-- ---- Quick Test ------
-- ----------------------
-- SELECT *
-- FROM toolboxTool
-- GO

-- SELECT *
-- FROM toolboxCategory
-- GO