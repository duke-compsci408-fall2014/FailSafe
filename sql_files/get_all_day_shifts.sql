DELIMITER //
CREATE PROCEDURE get_all_shifts (IN datevalue VARCHAR(50))
BEGIN
  SELECT *
  FROM tblUser
  WHERE ShiftHour = STR_TO_DATE(datevalue, '%Y,%m,%dT%h,%i,%s')
END //
DELIMITER ;