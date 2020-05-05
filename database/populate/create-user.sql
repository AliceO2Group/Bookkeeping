CREATE USER 'cern'@'%' IDENTIFIED BY 'cern';

GRANT ALL PRIVILEGES ON bookkeeping.* TO 'cern'@'%' ;
GRANT ALL PRIVILEGES ON bookkeeping_test.* TO 'cern'@'%' ;
