USE /*[giba_demo]*/
GO
-- will use prefix 'lilo' to all table names

-- ### ### ### ### this part was originally loginDB

-- *** *** *** ***
-- dropping constraints and tables (reset)
-- *** *** *** ***

-- Drop constraint if it already exists
-- Table: liloLoan
-- Constraint: liloFK_Loan_User, liloFK_Loan_Book
ALTER TABLE dbo.liloLoan
DROP CONSTRAINT IF EXISTS liloFK_Loan_User
GO
ALTER TABLE dbo.liloLoan
DROP CONSTRAINT IF EXISTS liloFK_Loan_Book
GO
-- Drop the table if it already exists
-- Table: liloLoan
DROP TABLE IF EXISTS dbo.liloLoan
GO


-- Drop constraint if it already exists
-- Table: liloPassword
-- Constraint: FK_liloPassword_liloUser
ALTER TABLE dbo.liloPassword
DROP CONSTRAINT IF EXISTS FK_liloPassword_liloUser
GO
-- Drop the table if it already exists
-- Table: liloPassword
DROP TABLE IF EXISTS dbo.liloPassword
GO

-- Drop constraint if it already exists
-- Table: liloUser
-- Constraint: FK_liloUser_liloRole
ALTER TABLE dbo.liloUser
DROP CONSTRAINT IF EXISTS FK_liloUser_liloRole
GO
-- Drop the table if it already exists
-- Table: liloUser
DROP TABLE IF EXISTS dbo.liloUser
GO

-- Drop the table if it already exists
-- Table: liloRole
DROP TABLE if EXISTS dbo.liloRole
GO
-- end of: dropping constraints and tables


-- *** *** *** ***
-- creating tables: liloRole, liloUser, liloPassword
-- *** *** *** ***
CREATE TABLE liloRole
(
    roleId INT IDENTITY NOT NULL PRIMARY KEY,
    roleName NVARCHAR(50) NOT NULL,
    roleDescription NVARCHAR(255)
)
GO

CREATE TABLE liloUser
(
    userId INT IDENTITY NOT NULL PRIMARY KEY,
    userName NVARCHAR(50) NOT NULL,
    userEmail NVARCHAR(255) NOT NULL,
    FK_roleId INT NOT NULL,

    CONSTRAINT FK_liloUser_liloRole FOREIGN KEY (FK_roleId) REFERENCES liloRole (roleId)
)
GO

CREATE TABLE liloPassword
(
    passwordValue NVARCHAR(255) NOT NULL,
    FK_userId INT NOT NULL,

    CONSTRAINT FK_liloPassword_liloUser FOREIGN KEY (FK_userId) REFERENCES liloUser (userId)
)
GO
-- end of: creating tables


-- *** *** *** ***
-- populating tables with test data for 'lilo - workshop part 2'
-- *** *** *** ***
INSERT INTO liloRole
    ([roleName], [roleDescription])
VALUES
    ('admin', 'can do whatever'),
    ('member', 'can do stuff that is allowed'),
    -- added librarian role
    ('librarian', 'can do most stuff with books, but not accounts')
GO

-- admin@lilo.mail.com, password: admin
INSERT INTO liloUser
    ([userName], [userEmail], [FK_roleId])
VALUES
    ('admin', 'admin@login.mail.com', 1)
GO

INSERT INTO liloPassword
    ([passwordValue], [FK_userId])
VALUES
    ('$2a$13$vcf4z958Oj2wq.hvS/BvOO8gc2bCkSH3nYgXTIAPLOChmoozcGPHy', 1)
GO
-- end of: populating tables with test data

-- *** *** *** ***
-- quick test
-- *** *** *** ***
SELECT *
FROM liloRole
GO

SELECT *
FROM liloUser
GO

SELECT *
FROM liloPassword
GO

-- end of: quick test

-- ### ### ### ### END: this part was originally loginDB

-- ### ### ### ### this part was originally libexDB in wad-library-...

-- Drop constraint if it already exists
-- Table: liloBookAuthor
-- Constraint: liloFK_BookAuthor_Author, liloFK_BookAuthor_Book
ALTER TABLE dbo.liloBookAuthor
DROP CONSTRAINT IF EXISTS liloFK_BookAuthor_Author
GO
ALTER TABLE dbo.liloBookAuthor
DROP CONSTRAINT IF EXISTS liloFK_BookAuthor_Book
GO
-- Drop the table if it already exists
-- Table: liloBookAuthor
DROP TABLE IF EXISTS dbo.liloBookAuthor
GO
-- Drop the table if it already exists
-- Table: liloBook
DROP TABLE IF EXISTS dbo.liloBook
GO
-- Drop the table if it already exists
-- Table: liloAuthor
DROP TABLE if EXISTS dbo.liloAuthor
GO


-- Creating the table(s)
-- Table: liloAuthor
CREATE TABLE dbo.liloAuthor
(
    authorid INT NOT NULL IDENTITY PRIMARY KEY,
    -- primary key column
    firstname NVARCHAR(50) NOT NULL,
    lastname NVARCHAR(50) NOT NULL,
    biolink NVARCHAR(255)
);
GO
-- Table: liloBook
CREATE TABLE dbo.liloBook
(
    bookid INT NOT NULL IDENTITY PRIMARY KEY,
    -- primary key column
    title NVARCHAR(50) NOT NULL,
    year INT,
    link NVARCHAR(255),
);
GO

-- Table: liloBookAuthor
CREATE TABLE dbo.liloBookAuthor
(
    FK_bookid INT NOT NULL,
    FK_authorid INT NOT NULL,

    CONSTRAINT liloFK_BookAuthor_Book FOREIGN KEY (FK_bookid) REFERENCES liloBook (bookid),
    CONSTRAINT liloFK_BookAuthor_Author FOREIGN KEY (FK_authorid) REFERENCES liloAuthor (authorid)
);
GO

-- --------------------------------
-- Populating the DB with test data
-- --------------------------------
-- Authors
INSERT INTO liloAuthor
    ([firstname],[lastname],[biolink])
VALUES
    ('Hans Christian', 'Andersen', 'https://en.wikipedia.org/wiki/Hans_Christian_Andersen'),
    ('Dante', 'Alighieri', 'https://en.wikipedia.org/wiki/Dante_Alighieri'),
    ('Jane', 'Austen', 'https://en.wikipedia.org/wiki/Jane_Austen'),
    ('Samuel', 'Beckett', 'https://en.wikipedia.org/wiki/Samuel_Beckett'),
    ('Giovanni', 'Boccaccio', 'https://en.wikipedia.org/wiki/Giovanni_Boccaccio')
GO
-- Books
INSERT INTO liloBook
    ([title],[year],[link])
VALUES
    ('Fairy tales', 1835, 'https://en.wikipedia.org/wiki/Fairy_Tales_Told_for_Children._First_Collection.'),
    ('Divine Comedy', 1320, 'https://en.wikipedia.org/wiki/Divine_Comedy'),
    ('Northanger Abbey', 1817, 'https://en.wikipedia.org/wiki/Northanger_Abbey'),
    ('Molloy', 1955, 'https://en.wikipedia.org/wiki/Molloy_(novel)'),
    ('Pride and Prejudice', 1813, 'https://en.wikipedia.org/wiki/Pride_and_Prejudice'),
    ('Malone Dies', 1956, 'https://en.wikipedia.org/wiki/Malone_Dies'),
    ('Decameron', 1353, 'https://en.wikipedia.org/wiki/The_Decameron'),
    ('The Unnamable', 1958, 'https://en.wikipedia.org/wiki/The_Unnamable_(novel)')
GO

INSERT INTO liloBookAuthor
    ([FK_bookid], [FK_authorid])
VALUES
    (1, 1),
    (4, 2),
    (2, 2),
    (3, 3),
    (4, 4),
    (5, 3),
    (8, 4),
    (6, 4),
    (3, 1),
    (7, 5),
    (8, 2)
GO
-- --------------------------------
-- ------ End of test data --------
-- --------------------------------

-- --------------------------------
-- --------- Show tables ----------
-- --------------------------------
SELECT *
FROM liloAuthor
GO
SELECT *
FROM liloBook
GO
SELECT *
FROM liloBook
    INNER JOIN liloBookAuthor
    ON liloBook.bookid = liloBookAuthor.FK_bookid
    INNER JOIN liloAuthor
    ON liloBookAuthor.FK_authorid = liloAuthor.authorid
GO
SELECT *
FROM liloBook
    INNER JOIN liloBookAuthor
    ON liloBook.bookid = liloBookAuthor.FK_bookid
    INNER JOIN liloAuthor
    ON liloBookAuthor.FK_authorid = liloAuthor.authorid
ORDER BY liloBook.title
GO

-- ### ### ### ### END: this part was originally libexDB in wad-library-...

-- ### ### ### ### THIS IS THE NEW ADDITION: liloLoan


-- Table: liloLoan
CREATE TABLE dbo.liloLoan
(
    loanId INT NOT NULL IDENTITY PRIMARY KEY,
    FK_bookid INT NOT NULL,
    FK_userId INT NOT NULL,
    startDate BIGINT NOT NULL,
    dueDate BIGINT NOT NULL,
    returnDate BIGINT,

    CONSTRAINT liloFK_Loan_Book FOREIGN KEY (FK_bookid) REFERENCES liloBook (bookid),
    CONSTRAINT liloFK_Loan_User FOREIGN KEY (FK_userId) REFERENCES liloUser (userId)
);
GO

-- --------------------------------
-- Populating the DB with test data
-- --------------------------------
-- Loan

INSERT INTO liloLoan
    (FK_bookid, FK_userId, startDate, dueDate)
VALUES
    -- admin loans Fairy Tales book on 1st January, 1970 with dueDate a week later
    (1, 1, 0, 604800)
GO

-- END: Populating the DB with test data

SELECT *
FROM liloLoan
GO