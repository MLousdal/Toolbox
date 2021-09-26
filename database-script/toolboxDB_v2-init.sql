USE [1086118]
GO
-- --------------------------------------------
-- --- TIPS AND TRICKS / THINGS TO REMEMBER ---
-- --------------------------------------------

-- 1. You can't refer/reference something that hasen't been created yet. Like with INSERT'ing content into Tool, you need have 
--    the Categories created before using them in INSERT INTO toolboxTool. Like with referencing a FK, you need to have the tabel where th PK is before you can find it.

-- 2. If you have something with NOT NULL, you have to make sure to give the data when doing things like INSERT INTO. Otherwise you can get an error like:
--    Msg 515, Level 16, State 2, Line 169
--    Cannot insert the value NULL into column 'FK_categoryId', table '1086088.dbo.toolboxTool'; column does not allow nulls. INSERT fails.

-- Information
-- Prefix to be used: toolbox.
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

-- Table: toolboxTool
-- Constraint: FK_toolboxUser_toolboxTool
ALTER TABLE toolboxTool
DROP CONSTRAINT IF EXISTS FK_toolboxUser_toolboxTool
GO

-- Table: toolboxTool
-- Constraint: FK_toolboxCategory_toolboxTool
ALTER TABLE toolboxTool
DROP CONSTRAINT IF EXISTS FK_toolboxCategory_toolboxTool
GO

-- Table toolboxFavorite
-- Constraint: FK_toolboxUser_toolboxFavorite
ALTER TABLE toolboxFavorite
DROP CONSTRAINT IF EXISTS FK_toolboxUser_toolboxFavorite
GO

-- Table toolboxFavorite
-- Constraint: FK_toolboxTool_toolboxFavorite
ALTER TABLE toolboxFavorite
DROP CONSTRAINT IF EXISTS FK_toolboxTool_toolboxFavorite
GO

-- ALTER TABLES: DONE

-- ----------------------
-- --- Dropping TABLE ---
-- ----------------------

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

-- Table: toolboxPassword
DROP TABLE IF EXISTS toolboxFavorite
GO

-- DROP TABLES: DONE

-- -----------------------
-- ---- Create Tables ----
-- -----------------------
-- Table of Contents:
    -- 1. toolboxRole
    -- 2. toolboxUser
    -- 3. toolboxCategory
    -- 4. toolboxPassword
    -- 5. toolboxTool
    -- 6. (v2) toolboxFavorite

-- Create #1
CREATE TABLE toolboxRole
(
    roleId INT NOT NULL IDENTITY PRIMARY KEY,
    roleName NVARCHAR(50) NOT NULL,
    roleDescription NVARCHAR(255)
)
GO

-- Create #2
CREATE TABLE toolboxUser
(
    userId INT NOT NULL IDENTITY PRIMARY KEY,
    userName NVARCHAR(50) NOT NULL,
    userEmail NVARCHAR(255) NOT NULL,
    userStatus NVARCHAR(50) NOT NULL,
    FK_roleId INT NOT NULL,

    CONSTRAINT FK_toolboxUser_toolboxRole FOREIGN KEY (FK_roleid) REFERENCES toolboxRole (roleid)
)
GO

-- Create #3
CREATE TABLE toolboxCategory
(
    categoryId INT NOT NULL IDENTITY PRIMARY KEY,
    categoryName NVARCHAR(50) NOT NULL
);
GO

-- Create #4
CREATE TABLE toolboxPassword
(
    FK_userId INT NOT NULL,
    passwordValue NVARCHAR(255) NOT NULL,

    CONSTRAINT FK_toolboxPassword_toolboxUser FOREIGN KEY (FK_userId) REFERENCES toolboxUser (userId)
);
GO

-- Create #5
CREATE TABLE toolboxTool
(
    toolId INT NOT NULL IDENTITY PRIMARY KEY,
    toolTitle NVARCHAR(50) NOT NULL,
    toolDescription NVARCHAR(128) NOT NULL,
    toolLink NVARCHAR(255) NOT NULL,
    toolStatus NVARCHAR(50) NOT NULL,

    FK_userId INT NOT NULL,
    FK_categoryId INT NOT NULL,

    CONSTRAINT FK_toolboxUser_toolboxTool FOREIGN KEY (FK_userId) REFERENCES toolboxUser (userId),
    CONSTRAINT FK_toolboxCategory_toolboxTool FOREIGN KEY (FK_categoryId) REFERENCES toolboxCategory (categoryId)
);
GO

-- Create #6
CREATE TABLE toolboxFavorite
(
    FK_userId INT NOT NULL,
    FK_toolId INT NOT NULL,

    CONSTRAINT FK_toolboxUser_toolboxFavorite FOREIGN KEY (FK_userId) REFERENCES toolboxUser (userId),
    CONSTRAINT FK_toolboxTool_toolboxFavorite FOREIGN KEY (FK_toolId) REFERENCES toolboxTool (toolId)
);
GO

-- CREATE TABLES: DONE

-- ----------------------------------------
-- --- Populating the DB with test data ---
-- ----------------------------------------

-- Roles
INSERT INTO toolboxRole
    ([roleName], [roleDescription])
VALUES
    ('Admin', 'Can do everything!'),
    ('Member', 'Can do most stuff!')
GO

-- Users
INSERT INTO toolboxUser
    ([userName], [userEmail], [userStatus], [FK_roleId])
VALUES
    ('Admin', 'admin@admin.com', 'active', 1),
    ('Member', 'member@member.com', 'active', 2)
GO

-- Categories
INSERT INTO toolboxCategory
    ([categoryName])
VALUES
    ('Design'),
    ('UserExperience'),
    ('FrontEnd'),
    ('BackEnd')
GO

-- Password
INSERT INTO toolboxPassword
    ([passwordValue], [FK_userId])
VALUES
    ('$2a$13$JziCT4oVJqOZQoGX2QPnR.iOlm2a60r.DAfJiR8dgoeItZU1uoh5W', 1), -- password before: admin
    ('$2a$13$/TRMjdrSIikP9Y5U3wHcLOwemUVq7J6qQy5qwjWFbcXEPm4lucZLi', 2)  -- password before: member
GO

-- Tools
INSERT INTO toolboxTool
    ([toolTitle], [toolDescription], [toolLink], [toolStatus], [FK_userId], [FK_categoryId])
VALUES
    ('Type Scale', 'A tool to have better scales between font sizes', 'https://type-scale.com/', 'active', 1, 1),
    ('Figma', 'Figma connects everyone in the design process so teams can deliver better products, faster.', 'https://www.figma.com/', 'active', 1, 1),
    ('Contrast Checker', 'Check if the color contrast passes accessibility standards.', 'https://webaim.org/resources/contrastchecker/', 'active', 1, 1),
    ('Unsplash', 'The internet’s source of freely-usable images. Powered by creators everywhere.', 'https://unsplash.com/', 'active', 1, 1),
    ('Coverr', 'Beautiful Free Stock Video Footage', 'https://coverr.co/', 'active', 1, 1),
    ('Open Doodles', 'A Free Set of Open-Source Illustrations!', 'https://opendoodles.com/', 'active', 1, 1),
    ('GlooMaps', 'Visual sitemaps made easy', 'https://www.gloomaps.com/', 'active', 1, 2),
    ('UXMISFITS', 'A great blog for learning UX', 'https://uxmisfit.com/', 'active', 1, 2),
    ('Growth design', 'Get product tips in a comic book format you’ll love to read.', 'https://growth.design/', 'active', 1, 2),
    ('Miro', 'The online collaborative whiteboard platform to bring teams together, anytime, anywhere.', 'https://miro.com/', 'active', 1, 2),
    ('Hotjar', 'Understand how users behave on your site, what they need, and how they feel, fast.', 'https://www.hotjar.com/', 'active', 1, 2),
    ('Persona', 'One platform, all the building blocks you need to create the ideal experience', 'https://withpersona.com/', 'active', 1, 2), 
    ('SASS', 'CSS with superpowers', 'https://sass-lang.com/', 'active', 1, 3),
    ('Parcel', 'Parcel is a compiler for all your code, regardless of the language or toolchain.', 'https://v2.parceljs.org/', 'active', 1, 3),
    ('Squoosh', 'Super good image compressor', 'https://squoosh.app/', 'active', 1, 3),
    ('Animate.css', 'Just-add-water CSS animations', 'https://animate.style/', 'active', 1, 3),
    ('Brumm', 'Make a smooth shadow, friend.', 'https://shadows.brumm.af/', 'active', 1, 3),
    ('React', 'A JavaScript library for building user interfaces', 'https://reactjs.org/', 'active', 1, 3),
    ('Strapi', 'Strapi is the leading open-source headless CMS.', 'https://strapi.io/', 'active', 1, 4),
    ('Huggingface', 'Datasets is a library for easily accessing and sharing datasets.', 'https://huggingface.co/docs/datasets/', 'active', 1, 4),
    ('Lucidchart', 'Lucidchart is the intelligent diagramming application that brings teams together.', 'https://www.lucidchart.com/pages/', 'active', 1, 4),
    ('QuickRef.ME', 'Here are some cheatsheets and quick references contributed by open source angels.', 'https://quickref.me/', 'active', 1, 4),
    ('Swagger', 'Swagger takes the manual work out of API documentation.', 'https://swagger.io/', 'active', 1, 4),
    ('Public APIs', 'A collective list of free APIs for use in software and web development', 'https://github.com/public-apis/public-apis', 'active', 1, 4)

GO

INSERT INTO toolboxFavorite
    ([FK_userId], [FK_toolId])
VALUES
    (2, 3),
    (2, 5),
    (2, 8),
    (2, 12)
GO

-- --------------------------------
-- ------ End of Test Data --------
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

SELECT *
FROM toolboxRole
GO

SELECT * 
FROM toolboxFavorite
GO