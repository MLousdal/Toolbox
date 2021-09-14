USE [1086118]
GO
-- will use prefix 'toolbox' to all table names

-- ### ### ### ### this part was originally loginDB

-- *** *** *** ***
-- dropping constraints and tables (reset)
-- *** *** *** ***

-- Drop constraint if it already exists
-- Table: toolboxPassword
-- Constraint: FK_toolboxPassword_toolboxUser
ALTER TABLE dbo.toolboxPassword
DROP CONSTRAINT IF EXISTS FK_toolboxPassword_toolboxUser
GO
-- Drop the table if it already exists
-- Table: toolboxPassword
DROP TABLE IF EXISTS dbo.toolboxPassword
GO

-- Drop constraint if it already exists
-- Table: toolboxUser
-- Constraint: FK_toolboxUser_toolboxRole
ALTER TABLE dbo.toolboxUser
DROP CONSTRAINT IF EXISTS FK_toolboxUser_toolboxRole
GO
-- Drop the table if it already exists
-- Table: toolboxUser
DROP TABLE IF EXISTS dbo.toolboxUser
GO

-- Drop the table if it already exists
-- Table: toolboxRole
DROP TABLE if EXISTS dbo.toolboxRole
GO


-- Drop constraint if it already exists
-- Table: toolboxUser
-- Constraint: FK_toolboxUser_toolboxRole
ALTER TABLE dbo.toolboxTool
DROP CONSTRAINT IF EXISTS FK_user_tool
GO
ALTER TABLE dbo.toolboxTool
DROP CONSTRAINT IF EXISTS FK_category_tool
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


-- *** *** *** ***
-- populating tables with test data for 'toolbox - workshop part 2'
-- *** *** *** ***
INSERT INTO toolboxRole
    ([roleName], [roleDescription])
VALUES
    ('admin', 'can do whatever'),
    ('member', 'can do stuff that is allowed')
GO

-- admin@admin.com, password: admin
-- member@member.com, password: member
INSERT INTO toolboxUser
    ([userName], [userEmail], [FK_roleid])
VALUES
    ('admin', 'admin@admin.com', 1),
    ('member', 'member@member.com', 2)
GO

INSERT INTO toolboxPassword
    ([passwordValue], [FK_userId])
VALUES
    ('admin', 1),
    ('member', 2)
GO
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

-- Tools
INSERT INTO toolboxTool
    ([title],[content],[link], [FK_userid], [FK_categoryid])
VALUES
    ("Type Scale", "A tool to have better scales between font sizes", "https://type-scale.com/", 1, 1),
    ("Figma", "Figma connects everyone in the design process so teams can deliver better products, faster.", "https://www.figma.com/", 1, 1),
    ("Web AIM: Contrast Checker", "Check if the color contrast passes accessibility standards.", "https://webaim.org/resources/contrastchecker/", 1, 1),
    ("Unsplash", "The internet’s source of freely-usable images. Powered by creators everywhere.", "https://unsplash.com/", 1, 1),
    ("Coverr", "Beautiful Free Stock Video Footage", "https://coverr.co/", 1, 1),
    ("Open Doodles", "A Free Set of Open-Source Illustrations!", "https://opendoodles.com/", 1, 1),
    ("GlooMaps", "https://www.gloomaps.com/", "https://www.gloomaps.com/", 1, 2),
    ("UXMISFITS", "A great blog for learning UX", "https://uxmisfit.com/", 1, 2),
    ("Growth design", "Get product tips in a comic book format you’ll love to read.", "https://growth.design/", 1, 2),
    ("Miro", "The online collaborative whiteboard platform to bring teams together, anytime, anywhere.", "https://miro.com/", 1, 2),
    ("Hotjar", "Understand how users behave on your site, what they need, and how they feel, fast.", "https://www.hotjar.com/", 1, 2),
    -- ("", "", "", 1, 2), need 1 more ux tool
    ("SASS", "CSS with superpowers", "https://sass-lang.com/", 1, 3),
    ("Parcel", "Parcel is a compiler for all your code, regardless of the language or toolchain.", "https://v2.parceljs.org/", 1, 3),
    ("Squoosh", "Super good image compressor", "https://squoosh.app/", 1, 3),
    ("Animate.css", "Just-add-water CSS animations", "https://animate.style/", 1, 3),
    ("Brumm", "Make a smooth shadow, friend.", "https://shadows.brumm.af/", 1, 3),
    ("React", "JavaScript framework :)", "https://reactjs.org/", 1, 3),
    ("Strapi", "Strapi is the leading open-source headless CMS.", "https://strapi.io/", 1, 4),
    ("Huggingface: Datasets", "Datasets is a library for easily accessing and sharing datasets.", "https://huggingface.co/docs/datasets/", 1, 4),
    ("Lucidchart", "Lucidchart is the intelligent diagramming application that brings teams together.", "https://www.lucidchart.com/pages/", 1, 4),
    ("QuickRef.ME", "Here are some cheatsheets and quick references contributed by open source angels.", "https://quickref.me/", 1, 4),
    ("Swagger", "Swagger takes the manual work out of API documentation.", "https://swagger.io/", 1, 4),
    ("Public APIs", "A collective list of free APIs for use in software and web development", "https://github.com/public-apis/public-apis", 1, 4)
GO
-- Categories
INSERT INTO toolboxCategory
    ([categoryid], [category])
VALUES
    ("design"),
    ("userExperience"),
    ("frontend"),
    ("backend")
GO

-- --------------------------------
-- ------ End of test data --------
-- --------------------------------

-- *** *** *** ***
-- quick test
-- *** *** *** ***
SELECT *
FROM toolboxTool
GO

SELECT *
FROM toolboxCategory
GO