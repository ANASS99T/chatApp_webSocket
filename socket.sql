/*!40101 SET NAMES utf8 */;
/*!40014 SET FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/ socket /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE socket;

DROP TABLE IF EXISTS users;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `name` varchar(255) DEFAULT NULL COMMENT 'user name',
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3;

DROP TABLE IF EXISTS messages;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `message` varchar(255) DEFAULT NULL COMMENT 'message',
  `user_id` int NOT NULL COMMENT 'foreign key',
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb3;

INSERT INTO messages(id,message,user_id,time) VALUES(63,'hello',6,'2021-05-25 17:10:10'),(64,'hey',5,'2021-05-25 17:10:14'),(65,'how are you',5,'2021-05-25 17:10:17'),(66,'I m good',6,'2021-05-25 17:10:22'),(67,'thank you',6,'2021-05-25 17:10:25'),(68,'goo bye',5,'2021-05-25 17:10:33'),(69,'g',5,'2021-05-25 17:10:36'),(70,'g',5,'2021-05-25 17:10:36'),(71,'g',5,'2021-05-25 17:10:37'),(72,'g',5,'2021-05-25 17:10:37'),(73,'g',5,'2021-05-25 17:10:37'),(74,'g',5,'2021-05-25 17:10:37');
INSERT INTO users(id,name,email,password) VALUES(5,'ANASS OULED BEN TAHAR','anass.taher@gmail.com','$2b$10$iW9JcrYdq2wCygBlnSd7G.bOLCuX7kIB1uzGd5glqaneHqhF0H6LK'),(6,'obito','anass.taher1@gmail.com','$2b$10$XfVHxgNQXS3.GD4jeK0lb.p64dtlkJhs8xpOjydyKQeY4Zl29DLL2');