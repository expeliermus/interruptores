-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: localhost    Database: desarrollo
-- ------------------------------------------------------
-- Server version	5.7.33-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `eventos`
--

DROP TABLE IF EXISTS `eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `eventos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cuando` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `evento` varchar(45) DEFAULT NULL,
  `info` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=191 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos`
--

LOCK TABLES `eventos` WRITE;
/*!40000 ALTER TABLE `eventos` DISABLE KEYS */;
INSERT INTO `eventos` VALUES (163,'2021-04-19 18:24:00','close','\"\"'),(164,'2021-04-19 18:24:00','offline','\"\"'),(165,'2021-04-19 18:24:01','reconnect','\"\"'),(166,'2021-04-19 18:27:18','connect','\"connack\"'),(167,'2021-04-19 19:19:51','offline','\"\"'),(168,'2021-04-19 19:19:51','close','\"\"'),(169,'2021-04-19 19:19:52','reconnect','\"\"'),(170,'2021-04-19 19:27:33','connect','\"connack\"'),(171,'2021-04-19 19:35:49','connect','\"connack\"'),(172,'2021-04-19 19:43:21','offline','\"\"'),(173,'2021-04-19 19:43:21','close','\"\"'),(174,'2021-04-19 19:43:22','reconnect','\"\"'),(175,'2021-04-19 19:43:34','connect','\"connack\"'),(176,'2021-04-19 20:14:51','offline','\"\"'),(177,'2021-04-19 20:14:51','close','\"\"'),(178,'2021-04-19 20:14:52','reconnect','\"\"'),(179,'2021-04-19 20:15:03','connect','\"connack\"'),(180,'2021-04-21 16:32:22','connect','\"connack\"'),(181,'2021-04-21 16:32:55','connect','\"connack\"'),(182,'2021-04-21 16:40:54','connect','\"connack\"'),(183,'2021-04-21 16:45:12','connect','\"connack\"'),(184,'2021-04-21 16:47:06','connect','\"connack\"'),(185,'2021-04-21 16:53:55','connect','\"connack\"'),(186,'2021-04-21 16:55:26','connect','\"connack\"'),(187,'2021-04-21 20:19:48','connect','\"connack\"'),(188,'2021-04-21 20:50:15','connect','\"connack\"'),(189,'2021-04-21 23:11:31','connect','\"connack\"'),(190,'2021-04-21 23:29:43','connect','\"connack\"');
/*!40000 ALTER TABLE `eventos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-04-22 22:04:50
