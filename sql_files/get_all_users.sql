DELIMITER //
CREATE PROCEDURE get_all_users
BEGIN
  SELECT FirstName, LastName, UserID
  FROM tblUser
END //
DELIMITER ;