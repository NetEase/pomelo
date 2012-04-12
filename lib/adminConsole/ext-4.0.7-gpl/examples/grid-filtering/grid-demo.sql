CREATE TABLE demo (
    id INTEGER(4) PRIMARY KEY,
    price REAL NOT NULL,
    company TEXT(255) NOT NULL,
    date DATETIME NOT NULL,
    size TEXT(45) NOT NULL,
    visible INTEGER(1) NOT NULL
);

INSERT INTO demo (id, price, company, date, size, visible) VALUES (1, 71.72, '3m Co', '2007-09-01', 'large', 1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (2, 29.01, 'Aloca Inc', '2007-08-01', 'medium', 0);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (3, 83.81, 'Altria Group Inc', '2007-08-03', 'large', 0);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (4, 52.55, 'American Express Company', '2008-01-04', 'extra large', 1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (5, 64.13, 'American International Group Inc.', '2008-03-04', 'small', 1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (6, 31.61, 'AT&T Inc.', '2008-02-01', 'extra large', 0);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (7, 75.43, 'Boeing Co.','2008-01-01','large',1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (8, 67.27, 'Caterpillar Inc.', '2007-12-03', 'medium', 1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (9, 49.37, 'Citigroup, Inc.', '2007-11-24', 'large', 1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (10, 40.48, 'E.I. du Pont de Nemours and Company', '2007-05-09', 'extra large', 0);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (11, 68.10, 'Exxon Mobile Corp', '2007-12-12', 'large', 1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (12, 34.14, 'General Electric Company', '2008-06-16', 'extra large', 1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (13, 30.27, 'General Motors Corporation', '2006-12-07', 'medium', 1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (14, 36.53, 'Hewlett-Packard Co.', '2007-05-13', 'large', 1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (15, 38.77, 'Honweywell Intl Inc', '2006-11-07', 'medium', 0);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (16, 19.88, 'Intel Corporation', '2007-01-09', 'small', 1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (17, 81.41, 'International Business Machines', '2005-01-21', 'extra large', 1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (18, 64.72, 'Johnson & Johnson', '2008-01-10', 'extra large', 1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (19, 45.73, 'JP Morgan & Chase & Co', '2008-02-20', 'large', 0);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (20, 36.76, "McDonald''s Corporation", '2007-06-12', 'large', 1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (21, 27.96, 'Pfizer Inc', '2007-12-30', 'small', 0);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (22, 45.07, 'The Coca-Cola Company', '2007-01-30', 'medium', 0);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (23, 34.64, 'The Home Depot, Inc', '2006-12-31', 'small', 1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (24, 61.91, 'The Procter & Gamble Company', '2007-04-08', 'extra large', 1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (25, 63.26, 'United Technologies Corporation', '2006-06-04', 'medium', 1);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (26, 35.57, 'Verizon Communications', '2005-07-09', 'small', 0);
INSERT INTO demo (id, price, company, date, size, visible) VALUES (27, 45.45, 'Wal-Mart Stores, Inc', '2006-09-09', 'large', 1);