CREATE TABLE tblUser (
    UserID INT NOT NULL AUTO_INCREMENT,	-- UserID should be INT for auto_increment
    Role VARCHAR(50) NOT NULL,
    IsAdministrator BOOLEAN,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    CellPhone VARCHAR(14) NOT NULL,		-- changed from integer to varchar for cell/home/pager
    HomePhone VARCHAR(14) NOT NULL,		-- may contain characters such as () or hyphen 
    PagerNumber VARCHAR(14) NOT NULL,	-- in addition to numbers
    NetID VARCHAR(10),
    PRIMARY KEY (UserID)				-- different syntax for repreenting primary key
);
