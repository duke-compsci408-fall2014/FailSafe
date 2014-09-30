CREATE TABLE OnCall(
	id INT NOT NULL AUTO_INCREMENT,
	startTime DATETIME NOT NULL,
	endTime DATETIME NOT NULL,
	faculty VARCHAR(80) NOT NULL,
	fellow VARCHAR(80) NOT NULL,
	rn1 VARCHAR(80) NOT NULL,
	rn2 VARCHAR(80) NOT NULL,
	tech1 VARCHAR(80) NOT NULL,
	tech2 VARCHAR(80) NOT NULL,
	PRIMARY KEY(startTime)
)