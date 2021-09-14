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
-- INSERT INTO toolboxTool
--     ([toolTitle])
-- VALUES
    -- ("Type Scale", "A tool to have better scales between font sizes", "https://type-scale.com/", 1, 1),
    -- ("Figma", "Figma connects everyone in the design process so teams can deliver better products, faster.", "https://www.figma.com/", 1, 1),
    -- ("Web AIM: Contrast Checker", "Check if the color contrast passes accessibility standards.", "https://webaim.org/resources/contrastchecker/", 1, 1),
    -- ("Unsplash", "The internet’s source of freely-usable images. Powered by creators everywhere.", "https://unsplash.com/", 1, 1),
    -- ("Coverr", "Beautiful Free Stock Video Footage", "https://coverr.co/", 1, 1),
    -- ("Open Doodles", "A Free Set of Open-Source Illustrations!", "https://opendoodles.com/", 1, 1),
    -- ("GlooMaps", "https://www.gloomaps.com/", "https://www.gloomaps.com/", 1, 2),
    -- ("UXMISFITS", "A great blog for learning UX", "https://uxmisfit.com/", 1, 2),
    -- ("Growth design", "Get product tips in a comic book format you’ll love to read.", "https://growth.design/", 1, 2),
    -- ("Miro", "The online collaborative whiteboard platform to bring teams together, anytime, anywhere.", "https://miro.com/", 1, 2),
    -- ("Hotjar", "Understand how users behave on your site, what they need, and how they feel, fast.", "https://www.hotjar.com/", 1, 2),
    -- -- ("", "", "", 1, 2), need 1 more ux tool
    -- ("SASS", "CSS with superpowers", "https://sass-lang.com/", 1, 3),
    -- ("Parcel", "Parcel is a compiler for all your code, regardless of the language or toolchain.", "https://v2.parceljs.org/", 1, 3),
    -- ("Squoosh", "Super good image compressor", "https://squoosh.app/", 1, 3),
    -- ("Animate.css", "Just-add-water CSS animations", "https://animate.style/", 1, 3),
    -- ("Brumm", "Make a smooth shadow, friend.", "https://shadows.brumm.af/", 1, 3),
    -- ("React", "JavaScript framework :)", "https://reactjs.org/", 1, 3),
    -- ("Strapi", "Strapi is the leading open-source headless CMS.", "https://strapi.io/", 1, 4),
    -- ("Huggingface: Datasets", "Datasets is a library for easily accessing and sharing datasets.", "https://huggingface.co/docs/datasets/", 1, 4),
    -- ("Lucidchart", "Lucidchart is the intelligent diagramming application that brings teams together.", "https://www.lucidchart.com/pages/", 1, 4),
    -- ("QuickRef.ME", "Here are some cheatsheets and quick references contributed by open source angels.", "https://quickref.me/", 1, 4),
    -- ("Swagger", "Swagger takes the manual work out of API documentation.", "https://swagger.io/", 1, 4),
    -- ("Public APIs", "A collective list of free APIs for use in software and web development", "https://github.com/public-apis/public-apis", 1, 4)

-- GO

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
