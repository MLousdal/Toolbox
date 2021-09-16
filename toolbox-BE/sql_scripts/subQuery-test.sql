USE [giba_demo]
GO

SELECT b.bookid, b.title, b.year, b.link, a.authorid, a.firstname, a.lastname
FROM liloBook b
    JOIN liloBookAuthor ba
        ON b.bookid = ba.FK_bookid
    JOIN liloAuthor a
        ON ba.FK_authorid = a.authorid
WHERE b.bookid IN 
            (SELECT b.bookid
            FROM liloBook b
                JOIN liloBookAuthor ba
                    ON b.bookid = ba.FK_bookid
                JOIN liloAuthor a
                    ON ba.FK_authorid = a.authorid
            WHERE a.authorid = 1)
ORDER BY b.bookid, a.authorid

-- Dofactory.com, 2020. SQL Subquery. [online] Available at https://www.dofactory.com/sql/subquery [Accessed 13 Sep. 2021].