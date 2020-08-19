-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: desarrollo
-- ------------------------------------------------------
-- Server version	5.7.30-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `todo`
--

DROP TABLE IF EXISTS `todo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `todo` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cuando` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `topic` varchar(45) DEFAULT NULL,
  `msg` varchar(100) DEFAULT NULL,
  `qos` smallint(5) unsigned DEFAULT NULL,
  `msgtype` varchar(10) DEFAULT NULL,
  `msgdata` varchar(100) DEFAULT NULL,
  `cant_items` smallint(5) unsigned DEFAULT NULL,
  `messageId` smallint(5) unsigned DEFAULT NULL,
  `cmd` varchar(15) DEFAULT NULL,
  `retain` varchar(10) DEFAULT NULL,
  `dup` varchar(10) DEFAULT NULL,
  `length` smallint(5) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2409 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `todo`
--

LOCK TABLES `todo` WRITE;
/*!40000 ALTER TABLE `todo` DISABLE KEYS */;
INSERT INTO `todo` VALUES (2369,'2020-06-27 22:24:30','P01H13C1/alta','0',0,'Buffer','0',7,NULL,'publish','0','0',16),(2370,'2020-06-27 22:24:38','P01H13C1/alta','1',0,'Buffer','1',7,NULL,'publish','0','0',16),(2371,'2020-06-27 22:25:54','11:11:11:11:11:11/vivo','estas?',0,'Buffer','estas?',7,NULL,'publish','0','0',30),(2372,'2020-06-27 22:25:54','77:77:77:77:77:77/vivo','estas?',0,'Buffer','estas?',7,NULL,'publish','0','0',30),(2373,'2020-06-27 22:25:54','84:0D:8E:83:9D:8A/vivo','estas?',0,'Buffer','estas?',7,NULL,'publish','0','0',30),(2374,'2020-06-27 22:25:54','84:0D:8E:83:9E:11/vivo','estas?',0,'Buffer','estas?',7,NULL,'publish','0','0',30),(2375,'2020-06-27 22:25:54','84:0D:8E:8C:86:F5/vivo','estas?',0,'Buffer','estas?',7,NULL,'publish','0','0',30),(2376,'2020-06-27 22:25:54','84:0D:8E:83:9E:DE/vivo','estas?',0,'Buffer','estas?',7,NULL,'publish','0','0',30),(2377,'2020-06-27 22:25:54','84:0D:8E:8C:88:DC/vivo','estas?',0,'Buffer','estas?',7,NULL,'publish','0','0',30),(2378,'2020-06-27 22:25:54','84:0D:8E:8C:8A:12/vivo','estas?',0,'Buffer','estas?',7,NULL,'publish','0','0',30),(2379,'2020-06-27 22:25:54','84:0D:8E:8C:89:F5/vivo','estas?',0,'Buffer','estas?',7,NULL,'publish','0','0',30),(2380,'2020-06-27 22:25:54','A0:20:A6:0B:42:81/vivo','estas?',0,'Buffer','estas?',7,NULL,'publish','0','0',30),(2381,'2020-06-27 22:25:54','84:0D:8E:8C:8B:7F/vivo','estas?',0,'Buffer','estas?',7,NULL,'publish','0','0',30),(2382,'2020-06-27 22:25:54','B4:E6:2D:69:D1:82/vivo','estas?',0,'Buffer','estas?',7,NULL,'publish','0','0',30),(2383,'2020-06-27 22:25:54','B4:E6:2D:69:CE:83/vivo','estas?',0,'Buffer','estas?',7,NULL,'publish','0','0',30),(2384,'2020-06-27 22:25:54','DC:4F:22:5E:C5:E2/vivo','estas?',0,'Buffer','estas?',7,NULL,'publish','0','0',30),(2385,'2020-06-27 22:25:54','CC:50:E3:11:08:D4/vivo','estas?',0,'Buffer','estas?',7,NULL,'publish','0','0',30),(2386,'2020-06-27 22:25:54','DC:4F:22:5E:C8:81/vivo','estas?',0,'Buffer','estas?',7,NULL,'publish','0','0',30),(2387,'2020-06-27 22:26:50','11:11:11:11:11:11/estado','0255;0512;0512',2,'Buffer','0255;0512;0512',8,8450,'publish','0','0',42),(2388,'2020-06-27 22:26:50','77:77:77:77:77:77/estado','0000;1023;0000',2,'Buffer','0000;1023;0000',8,8451,'publish','0','0',42),(2389,'2020-06-27 22:26:50','84:0D:8E:83:9D:8A/estado','0255;0512;0512',2,'Buffer','0255;0512;0512',8,8452,'publish','0','0',42),(2390,'2020-06-27 22:26:50','84:0D:8E:83:9E:11/estado','0255;0512;0512',2,'Buffer','0255;0512;0512',8,8453,'publish','0','0',42),(2391,'2020-06-27 22:26:50','84:0D:8E:8C:86:F5/estado','0255;0512;0512',2,'Buffer','0255;0512;0512',8,8455,'publish','0','0',42),(2392,'2020-06-27 22:26:50','84:0D:8E:83:9E:DE/estado','0255;0512;0512',2,'Buffer','0255;0512;0512',8,8454,'publish','0','0',42),(2393,'2020-06-27 22:26:50','84:0D:8E:8C:88:DC/estado','0255;0512;0512',2,'Buffer','0255;0512;0512',8,8456,'publish','0','0',42),(2394,'2020-06-27 22:26:50','84:0D:8E:8C:8A:12/estado','0255;0512;0512',2,'Buffer','0255;0512;0512',8,8458,'publish','0','0',42),(2395,'2020-06-27 22:26:50','84:0D:8E:8C:89:F5/estado','0255;0512;0512',2,'Buffer','0255;0512;0512',8,8457,'publish','0','0',42),(2396,'2020-06-27 22:26:50','84:0D:8E:8C:8B:7F/estado','0255;0512;0512',2,'Buffer','0255;0512;0512',8,8459,'publish','0','0',42),(2397,'2020-06-27 22:26:50','B4:E6:2D:69:CE:83/estado','0255;0512;0512',2,'Buffer','0255;0512;0512',8,8461,'publish','0','0',42),(2398,'2020-06-27 22:26:50','A0:20:A6:0B:42:81/estado','0255;0512;0512',2,'Buffer','0255;0512;0512',8,8460,'publish','0','0',42),(2399,'2020-06-27 22:26:50','CC:50:E3:11:08:D4/estado','0255;0512;0512',2,'Buffer','0255;0512;0512',8,8463,'publish','0','0',42),(2400,'2020-06-27 22:26:50','B4:E6:2D:69:D1:82/estado','0255;0512;0512',2,'Buffer','0255;0512;0512',8,8462,'publish','0','0',42),(2401,'2020-06-27 22:26:50','DC:4F:22:5E:C8:81/estado','0255;0512;0512',2,'Buffer','0255;0512;0512',8,8465,'publish','0','0',42),(2402,'2020-06-27 22:26:50','DC:4F:22:5E:C5:E2/estado','0255;0512;0512',2,'Buffer','0255;0512;0512',8,8464,'publish','0','0',42),(2403,'2020-06-27 22:26:55','alta/','77:77:77:77:77:77',1,'Buffer','77:77:77:77:77:77',8,8466,'publish','0','0',26),(2404,'2020-06-27 22:26:55','alta/','77:77:77:77:77:77',1,'Buffer','77:77:77:77:77:77',8,8466,'publish','0','0',26),(2405,'2020-06-27 22:26:55','77:77:77:77:77:77/estado','0000;1023;0000',2,'Buffer','0000;1023;0000',8,8467,'publish','0','0',42),(2406,'2020-06-27 22:27:06','alta/','A0:20:A6:0B:42:81',0,'Buffer','A0:20:A6:0B:42:81',7,NULL,'publish','0','0',24),(2407,'2020-06-27 22:27:06','alta/','A0:20:A6:0B:42:81',0,'Buffer','A0:20:A6:0B:42:81',7,NULL,'publish','0','0',24),(2408,'2020-06-27 22:27:06','A0:20:A6:0B:42:81/estado','0255;0512;0512',2,'Buffer','0255;0512;0512',8,8468,'publish','0','0',42);
/*!40000 ALTER TABLE `todo` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-07-10 12:16:03
