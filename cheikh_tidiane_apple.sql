-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: cheikh_tidiane_apple
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cartId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `color` varchar(255) DEFAULT NULL,
  `storage` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cartId` (`cartId`),
  KEY `productId` (`productId`),
  CONSTRAINT `cart_items_ibfk_336` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_ibfk_337` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `reminderSentAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId` (`userId`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,7,'2026-07-31 21:32:17','2026-07-31 21:32:17',NULL);
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `slug_2` (`slug`),
  UNIQUE KEY `slug_3` (`slug`),
  UNIQUE KEY `slug_4` (`slug`),
  UNIQUE KEY `slug_5` (`slug`),
  UNIQUE KEY `slug_6` (`slug`),
  UNIQUE KEY `slug_7` (`slug`),
  UNIQUE KEY `slug_8` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'iPhone','iphone',NULL,NULL,'2026-07-30 01:51:43','2026-07-30 01:51:43'),(2,'iPad','ipad',NULL,NULL,'2026-07-30 01:51:43','2026-07-30 01:51:43'),(3,'MacBook','macbook',NULL,NULL,'2026-07-30 01:51:43','2026-07-30 01:51:43');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `favorites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `favorites_user_id_product_id` (`userId`,`productId`),
  KEY `productId` (`productId`),
  CONSTRAINT `favorites_ibfk_343` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `favorites_ibfk_344` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedbacks`
--

DROP TABLE IF EXISTS `feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `feedbacks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  `rating` int(11) NOT NULL,
  `comment` text NOT NULL,
  `isApproved` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedbacks`
--

LOCK TABLES `feedbacks` WRITE;
/*!40000 ALTER TABLE `feedbacks` DISABLE KEYS */;
/*!40000 ALTER TABLE `feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lebalma_contracts`
--

DROP TABLE IF EXISTS `lebalma_contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lebalma_contracts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reference` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `orderId` int(11) DEFAULT NULL,
  `frequency` enum('weekly','monthly') NOT NULL,
  `productPrice` int(11) NOT NULL,
  `downPaymentPercent` float NOT NULL,
  `downPaymentAmount` int(11) NOT NULL,
  `financedAmount` int(11) NOT NULL,
  `installmentsCount` int(11) NOT NULL,
  `installmentAmount` int(11) NOT NULL,
  `totalAmount` int(11) NOT NULL,
  `status` enum('pending','active','completed','defaulted','cancelled') DEFAULT 'pending',
  `startDate` date DEFAULT NULL,
  `deviceDeliveredAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  UNIQUE KEY `reference_2` (`reference`),
  UNIQUE KEY `reference_3` (`reference`),
  UNIQUE KEY `reference_4` (`reference`),
  UNIQUE KEY `reference_5` (`reference`),
  UNIQUE KEY `reference_6` (`reference`),
  UNIQUE KEY `reference_7` (`reference`),
  UNIQUE KEY `reference_8` (`reference`),
  KEY `userId` (`userId`),
  KEY `productId` (`productId`),
  CONSTRAINT `lebalma_contracts_ibfk_135` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lebalma_contracts_ibfk_136` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lebalma_contracts`
--

LOCK TABLES `lebalma_contracts` WRITE;
/*!40000 ALTER TABLE `lebalma_contracts` DISABLE KEYS */;
INSERT INTO `lebalma_contracts` VALUES (1,'DEMO-LEB-001',2,1,NULL,'monthly',120000,40,48000,115200,3,38400,163200,'completed','2026-06-01','2026-06-01 12:10:08','2026-07-31 12:10:08','2026-07-31 12:28:12'),(2,'DEMO-LEB-002',3,2,NULL,'monthly',150000,40,60000,144000,3,48000,204000,'active','2026-07-29','2026-07-31 22:02:32','2026-07-31 12:10:08','2026-07-31 22:02:32'),(3,'DEMO-LEB-003',5,3,NULL,'monthly',160000,40,64000,153600,3,51200,217600,'completed','2026-01-12','2026-01-12 12:10:08','2026-07-31 12:10:08','2026-07-31 12:10:08'),(4,'DEMO-LEB-004',6,4,NULL,'monthly',140000,40,56000,134400,3,44800,190400,'defaulted','2026-04-02','2026-04-02 12:10:08','2026-07-31 12:10:08','2026-07-31 12:10:08'),(5,'DEMO-LEB-005',2,5,NULL,'monthly',170000,40,68000,163200,3,54400,231200,'active','2026-07-01',NULL,'2026-07-31 12:10:08','2026-07-31 22:52:15');
/*!40000 ALTER TABLE `lebalma_contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lebalma_installments`
--

DROP TABLE IF EXISTS `lebalma_installments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lebalma_installments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contractId` int(11) NOT NULL,
  `sequence` int(11) NOT NULL,
  `dueDate` date NOT NULL,
  `amount` int(11) NOT NULL,
  `status` enum('upcoming','pending','paid','late') DEFAULT 'upcoming',
  `paidAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `paymentMethod` varchar(255) DEFAULT NULL,
  `paymentInitiatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contractId` (`contractId`),
  CONSTRAINT `lebalma_installments_ibfk_1` FOREIGN KEY (`contractId`) REFERENCES `lebalma_contracts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lebalma_installments`
--

LOCK TABLES `lebalma_installments` WRITE;
/*!40000 ALTER TABLE `lebalma_installments` DISABLE KEYS */;
INSERT INTO `lebalma_installments` VALUES (1,1,1,'2026-07-01',38400,'paid','2026-07-01 12:10:08','2026-07-31 12:10:08','2026-07-31 12:10:08',NULL,NULL),(2,1,2,'2026-08-01',38400,'paid','2026-08-01 12:10:08','2026-07-31 12:10:08','2026-07-31 12:10:08',NULL,NULL),(3,1,3,'2026-09-01',38400,'paid','2026-07-31 12:28:11','2026-07-31 12:10:08','2026-07-31 12:28:11',NULL,NULL),(4,2,1,'2026-08-29',48000,'upcoming',NULL,'2026-07-31 12:10:08','2026-07-31 12:10:08',NULL,NULL),(5,2,2,'2026-09-29',48000,'upcoming',NULL,'2026-07-31 12:10:08','2026-07-31 12:10:08',NULL,NULL),(6,2,3,'2026-10-29',48000,'upcoming',NULL,'2026-07-31 12:10:08','2026-07-31 12:10:08',NULL,NULL),(7,3,1,'2026-02-12',51200,'paid','2026-02-12 12:10:08','2026-07-31 12:10:08','2026-07-31 12:10:08',NULL,NULL),(8,3,2,'2026-03-12',51200,'paid','2026-03-12 12:10:08','2026-07-31 12:10:08','2026-07-31 12:10:08',NULL,NULL),(9,3,3,'2026-04-12',51200,'paid','2026-04-12 12:10:08','2026-07-31 12:10:08','2026-07-31 12:10:08',NULL,NULL),(10,4,1,'2026-05-02',44800,'paid','2026-05-02 12:10:08','2026-07-31 12:10:08','2026-07-31 12:10:08',NULL,NULL),(11,4,2,'2026-06-02',44800,'late',NULL,'2026-07-31 12:10:08','2026-07-31 12:10:08',NULL,NULL),(12,4,3,'2026-07-02',44800,'late',NULL,'2026-07-31 12:10:08','2026-07-31 12:10:08',NULL,NULL),(13,5,1,'2026-08-01',54400,'paid','2026-07-31 22:52:15','2026-07-31 12:10:08','2026-07-31 22:52:15',NULL,NULL),(14,5,2,'2026-09-01',54400,'upcoming',NULL,'2026-07-31 12:10:08','2026-07-31 12:10:08',NULL,NULL),(15,5,3,'2026-10-01',54400,'upcoming',NULL,'2026-07-31 12:10:08','2026-07-31 12:10:08',NULL,NULL);
/*!40000 ALTER TABLE `lebalma_installments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `isRead` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,'lebalma_installment','Contrat Lebalma soldé','Félicitations ! Votre contrat DEMO-LEB-001 est entièrement réglé.','/orders',0,'2026-07-31 12:28:12','2026-07-31 12:28:12'),(2,7,'order_confirm','Commande enregistrée','Votre commande CMD-MS9GKEYG a bien été reçue. Total : 95 000 FCFA.','/orders',0,'2026-07-31 21:32:17','2026-07-31 21:32:17'),(3,7,'order_paid','Paiement confirmé','Le paiement de votre commande CMD-MS9GKEYG (95 000 FCFA) est confirmé.','/orders',0,'2026-07-31 21:32:17','2026-07-31 21:32:17'),(4,3,'lebalma_delivered','Appareil remis','Votre appareil (contrat DEMO-LEB-002) a été remis. Bon usage !','/orders',0,'2026-07-31 22:02:32','2026-07-31 22:02:32'),(5,2,'lebalma_installment','Échéance réglée','Échéance n°1 du contrat DEMO-LEB-005 réglée (54 400 FCFA).','/mes-financements',1,'2026-07-31 22:52:15','2026-07-31 22:52:32'),(6,8,'lebalma_installment','Échéance Lebalma payée','Échéance n°1 — contrat DEMO-LEB-005 (54 400 FCFA).','/admin/lebalma',0,'2026-07-31 22:52:15','2026-07-31 22:52:15'),(7,8,'order_new','Nouvelle commande','Commande CMD-MSCCQTVO — 192 000 FCFA','/admin/orders',0,'2026-08-02 22:08:36','2026-08-02 22:08:36'),(8,2,'order_confirm','Commande enregistrée','Votre commande CMD-MSCCQTVO a bien été reçue. Total : 192 000 FCFA.','/orders',0,'2026-08-02 22:08:36','2026-08-02 22:08:36'),(9,8,'order_new','Nouvelle commande','Commande CMD-MSCGKNQ0 — 151 000 FCFA','/admin/orders',0,'2026-08-02 23:55:47','2026-08-02 23:55:47'),(10,9,'order_confirm','Commande enregistrée','Votre commande CMD-MSCGKNQ0 a bien été reçue. Total : 151 000 FCFA.','/orders',0,'2026-08-02 23:55:47','2026-08-02 23:55:47'),(11,9,'order_paid','Paiement confirmé','Le paiement de votre commande CMD-MSCGKNQ0 (151 000 FCFA) est confirmé.','/orders',0,'2026-08-02 23:55:54','2026-08-02 23:55:54'),(12,8,'order_paid','Commande payée','Commande CMD-MSCGKNQ0 réglée (151 000 FCFA).','/admin/orders',0,'2026-08-02 23:55:54','2026-08-02 23:55:54');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderId` int(11) NOT NULL,
  `productId` int(11) DEFAULT NULL,
  `productName` varchar(255) DEFAULT NULL,
  `unitPrice` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `color` varchar(255) DEFAULT NULL,
  `storage` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `productId` (`productId`),
  CONSTRAINT `order_items_ibfk_33` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_ibfk_34` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,4,'iPhone 12 Simple',140000,1,'Noir','64 Go','2026-07-31 12:10:08','2026-07-31 12:10:08'),(2,2,6,'iPhone 12 Pro Max',220000,1,'Noir','128 Go','2026-07-31 12:10:08','2026-07-31 12:10:08'),(3,2,9,'iPhone 13 Pro Max',250000,1,'Noir','128 Go','2026-07-31 12:10:08','2026-07-31 12:10:08'),(4,3,2,'iPhone 11 Pro',150000,1,'Noir','64 Go','2026-07-31 12:10:08','2026-07-31 12:10:08'),(5,4,7,'iPhone 13 Simple',180000,1,'Noir','128 Go','2026-07-31 12:10:08','2026-07-31 12:10:08'),(6,5,3,'iPhone 11 Pro Max',160000,2,'Noir','64 Go','2026-07-31 12:10:08','2026-07-31 12:10:08'),(7,6,8,'iPhone 13 Pro',230000,1,'Noir','128 Go','2026-07-31 12:10:08','2026-07-31 12:10:08'),(8,7,5,'iPhone 12 Pro',170000,1,'Noir','128 Go','2026-07-31 12:10:08','2026-07-31 12:10:08'),(9,8,1,'iPhone 11 Simple',120000,1,'Noir','64 Go','2026-07-31 12:10:08','2026-07-31 12:10:08'),(10,9,10,'iPhone 14 Simple',220000,1,'Noir','128 Go','2026-07-31 12:10:08','2026-07-31 12:10:08'),(11,10,25,'iPhone XR',95000,1,NULL,NULL,'2026-07-31 21:32:17','2026-07-31 21:32:17'),(12,11,25,'iPhone XR',95000,2,NULL,NULL,'2026-08-02 22:08:36','2026-08-02 22:08:36'),(13,12,2,'iPhone 11 Pro',150000,1,'Noir','64 Go','2026-08-02 23:55:47','2026-08-02 23:55:47'),(14,13,25,'iPhone XR',95000,1,NULL,NULL,'2026-08-11 12:51:25','2026-08-11 12:51:25');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reference` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `status` enum('pending','paid','processing','shipped','delivered','cancelled','returned') DEFAULT 'pending',
  `subtotal` int(11) DEFAULT 0,
  `shippingFee` int(11) DEFAULT 0,
  `total` int(11) DEFAULT 0,
  `paymentMethod` enum('wave','orange_money','card','lebalma','cash') DEFAULT NULL,
  `paymentStatus` enum('pending','success','failed','refunded') DEFAULT 'pending',
  `isLebalma` tinyint(1) DEFAULT 0,
  `shippingName` varchar(255) DEFAULT NULL,
  `shippingPhone` varchar(255) DEFAULT NULL,
  `shippingAddress` varchar(255) DEFAULT NULL,
  `shippingCity` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  UNIQUE KEY `reference_2` (`reference`),
  UNIQUE KEY `reference_3` (`reference`),
  UNIQUE KEY `reference_4` (`reference`),
  UNIQUE KEY `reference_5` (`reference`),
  UNIQUE KEY `reference_6` (`reference`),
  UNIQUE KEY `reference_7` (`reference`),
  UNIQUE KEY `reference_8` (`reference`),
  KEY `userId` (`userId`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'DEMO-CMD-001',2,'delivered',140000,2000,142000,'wave','success',0,'Awa Ndiaye','+221770000001','Sacré-Cœur 3','Dakar','2026-07-11 12:10:08','2026-07-31 12:10:08'),(2,'DEMO-CMD-002',3,'shipped',470000,2000,472000,'orange_money','success',0,'Modou Fall','+221770000002','Cité Malick Sy','Thiès','2026-07-25 12:10:08','2026-07-31 12:10:08'),(3,'DEMO-CMD-003',4,'pending',150000,2000,152000,'card','pending',0,'Fatou Sarr','+221770000003','Liberté 6','Dakar','2026-07-30 12:10:08','2026-07-31 12:10:08'),(4,'DEMO-CMD-004',5,'processing',180000,2000,182000,'wave','success',0,'Ibrahima Bâ','+221770000004','Keury Kao','Rufisque','2026-07-28 12:10:08','2026-07-31 12:10:08'),(5,'DEMO-CMD-005',6,'paid',320000,2000,322000,'card','success',0,'Aïssatou Diop','+221770000005','Point E','Dakar','2026-07-29 12:10:08','2026-07-31 12:10:08'),(6,'DEMO-CMD-006',2,'paid',230000,2000,232000,'orange_money','success',0,'Awa Ndiaye','+221770000001','Sacré-Cœur 3','Dakar','2026-07-21 12:10:08','2026-07-31 12:10:08'),(7,'DEMO-CMD-007',3,'cancelled',170000,2000,172000,'card','failed',0,'Modou Fall','+221770000002','Cité Malick Sy','Thiès','2026-07-17 12:10:08','2026-07-31 12:10:08'),(8,'DEMO-CMD-008',4,'delivered',120000,2000,122000,'wave','success',0,'Fatou Sarr','+221770000003','Liberté 6','Dakar','2026-07-06 12:10:08','2026-07-31 12:10:08'),(9,'DEMO-CMD-009',5,'pending',220000,2000,222000,'wave','pending',0,'Ibrahima Bâ','+221770000004','Keury Kao','Rufisque','2026-07-31 12:10:08','2026-07-31 12:10:08'),(10,'CMD-MS9GKEYG',7,'paid',95000,0,95000,'wave','success',0,'Pay Test','770','Dakar','Dakar','2026-07-31 21:32:17','2026-07-31 21:32:17'),(11,'CMD-MSCCQTVO',2,'pending',190000,2000,192000,'wave','pending',0,'Awa Ndiaye','+221770000001','Ngor Almadies','Almadies / Ngor / Yoff','2026-08-02 22:08:36','2026-08-02 22:08:36'),(12,'CMD-MSCGKNQ0',9,'paid',150000,1000,151000,'wave','success',0,'aminata traore','+221708289273','136 rue DK0001N01','Keur Massar / Malika','2026-08-02 23:55:47','2026-08-02 23:55:54'),(13,'CMD-MSONSY2M',10,'paid',95000,0,95000,'cash','success',0,'Ibrahima Mbaye','700005200',NULL,NULL,'2026-08-11 12:51:25','2026-08-11 12:51:25');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderId` int(11) DEFAULT NULL,
  `installmentId` int(11) DEFAULT NULL,
  `userId` int(11) NOT NULL,
  `method` enum('wave','orange_money','card','lebalma','cash') NOT NULL,
  `amount` int(11) NOT NULL,
  `status` enum('pending','success','failed','refunded') DEFAULT 'pending',
  `providerRef` varchar(255) DEFAULT NULL,
  `rawResponse` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rawResponse`)),
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `purpose` varchar(255) DEFAULT 'order',
  `provider` varchar(255) DEFAULT NULL,
  `idempotencyKey` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idempotencyKey` (`idempotencyKey`),
  UNIQUE KEY `idempotencyKey_2` (`idempotencyKey`),
  UNIQUE KEY `idempotencyKey_3` (`idempotencyKey`),
  UNIQUE KEY `idempotencyKey_4` (`idempotencyKey`),
  UNIQUE KEY `idempotencyKey_5` (`idempotencyKey`),
  UNIQUE KEY `idempotencyKey_6` (`idempotencyKey`),
  UNIQUE KEY `idempotencyKey_7` (`idempotencyKey`),
  UNIQUE KEY `idempotencyKey_8` (`idempotencyKey`),
  KEY `orderId` (`orderId`),
  KEY `installmentId` (`installmentId`),
  KEY `userId` (`userId`),
  CONSTRAINT `payments_ibfk_454` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `payments_ibfk_455` FOREIGN KEY (`installmentId`) REFERENCES `lebalma_installments` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `payments_ibfk_456` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,10,NULL,7,'wave',95000,'success','SIM-1',NULL,'2026-07-31 21:32:17','2026-07-31 21:32:17','order','simulation','PAY-order-10-ms9gkf2y-36f48b'),(2,NULL,13,2,'wave',54400,'success','SIM-2',NULL,'2026-07-31 22:51:59','2026-07-31 22:52:15','installment','simulation','PAY-installment-13-ms9jewn1-463d74'),(3,12,NULL,9,'wave',151000,'success','SIM-3',NULL,'2026-08-02 23:55:47','2026-08-02 23:55:54','order','simulation','PAY-order-12-mscgknv8-d084b2');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `price` int(11) NOT NULL,
  `oldPrice` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `colors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`colors`)),
  `storages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`storages`)),
  `variants` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variants`)),
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `specs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specs`)),
  `newAvailable` tinyint(1) DEFAULT 0,
  `isPromo` tinyint(1) DEFAULT 0,
  `isFeatured` tinyint(1) DEFAULT 0,
  `isTopSale` tinyint(1) DEFAULT 0,
  `isNew` tinyint(1) DEFAULT 0,
  `soldCount` int(11) DEFAULT 0,
  `ratingAvg` float DEFAULT 0,
  `ratingCount` int(11) DEFAULT 0,
  `lebalmaEligible` tinyint(1) DEFAULT 0,
  `lebalmaFrequency` enum('weekly','monthly') DEFAULT 'monthly',
  `lebalmaDownPercent` float DEFAULT 0,
  `lebalmaMonths` int(11) DEFAULT 0,
  `lebalmaMultiplier` float DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `categoryId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `slug_2` (`slug`),
  UNIQUE KEY `slug_3` (`slug`),
  UNIQUE KEY `slug_4` (`slug`),
  UNIQUE KEY `slug_5` (`slug`),
  UNIQUE KEY `slug_6` (`slug`),
  UNIQUE KEY `slug_7` (`slug`),
  UNIQUE KEY `slug_8` (`slug`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'iPhone 11 Simple','iphone-11-simple','Apple iPhone 11 Simple. Éligible au paiement échelonné Lebalma sur 3 mois.','iPhone 11 Simple',120000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"64 Go\",\"128 Go\"]','[{\"storage\":\"64 Go\",\"price\":120000},{\"storage\":\"128 Go\",\"price\":130000}]','[]','{}',0,0,0,0,1,0,5,1,1,'monthly',40,3,1.6,'2026-07-30 01:51:43','2026-08-06 17:02:52',1),(2,'iPhone 11 Pro','iphone-11-pro','Apple iPhone 11 Pro. Éligible au paiement échelonné Lebalma sur 3 mois.','iPhone 11 Pro',150000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"64 Go\",\"256 Go\"]','[{\"storage\":\"64 Go\",\"price\":150000},{\"storage\":\"256 Go\",\"price\":160000}]','[]','{}',0,0,0,0,0,0,4.7,29,1,'monthly',40,3,1.6,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(3,'iPhone 11 Pro Max','iphone-11-pro-max','Apple iPhone 11 Pro Max. Éligible au paiement échelonné Lebalma sur 3 mois.','iPhone 11 Pro Max',160000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"64 Go\",\"256 Go\"]','[{\"storage\":\"64 Go\",\"price\":160000},{\"storage\":\"256 Go\",\"price\":170000}]','[]','{}',0,0,0,0,0,0,4.8,44,1,'monthly',40,3,1.6,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(4,'iPhone 12 Simple','iphone-12-simple','Apple iPhone 12 Simple. Éligible au paiement échelonné Lebalma sur 3 mois.','iPhone 12 Simple',140000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"64 Go\",\"128 Go\"]','[{\"storage\":\"64 Go\",\"price\":140000},{\"storage\":\"128 Go\",\"price\":150000}]','[]','{}',0,0,0,0,0,0,4.8,44,1,'monthly',40,3,1.6,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(5,'iPhone 12 Pro','iphone-12-pro','Apple iPhone 12 Pro. Éligible au paiement échelonné Lebalma sur 3 mois.','iPhone 12 Pro',170000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"128 Go\",\"256 Go\"]','[{\"storage\":\"128 Go\",\"price\":170000},{\"storage\":\"256 Go\",\"price\":180000}]','[]','{}',0,0,0,0,0,0,4.9,39,1,'monthly',40,3,1.6,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(6,'iPhone 12 Pro Max','iphone-12-pro-max','Apple iPhone 12 Pro Max. Éligible au paiement échelonné Lebalma sur 3 mois.','iPhone 12 Pro Max',220000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"128 Go\",\"256 Go\"]','[{\"storage\":\"128 Go\",\"price\":220000},{\"storage\":\"256 Go\",\"price\":230000}]','[]','{}',0,0,0,0,0,0,4.1,22,1,'monthly',40,3,1.6,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(7,'iPhone 13 Simple','iphone-13-simple','Apple iPhone 13 Simple. Éligible au paiement échelonné Lebalma sur 3 mois.','iPhone 13 Simple',180000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"128 Go\"]','[{\"storage\":\"128 Go\",\"price\":180000}]','[]','{}',0,0,0,0,0,0,4.5,27,1,'monthly',40,3,1.6,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(8,'iPhone 13 Pro','iphone-13-pro','Apple iPhone 13 Pro. Éligible au paiement échelonné Lebalma sur 3 mois.','iPhone 13 Pro',230000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"128 Go\"]','[{\"storage\":\"128 Go\",\"price\":230000}]','[]','{}',0,0,0,0,0,0,4.8,40,1,'monthly',40,3,1.6,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(9,'iPhone 13 Pro Max','iphone-13-pro-max','Apple iPhone 13 Pro Max. Éligible au paiement échelonné Lebalma sur 3 mois.','iPhone 13 Pro Max',250000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"128 Go\",\"256 Go\"]','[{\"storage\":\"128 Go\",\"price\":250000},{\"storage\":\"256 Go\",\"price\":260000}]','[]','{}',0,0,0,0,0,0,4.9,7,1,'monthly',40,3,1.6,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(10,'iPhone 14 Simple','iphone-14-simple','Apple iPhone 14 Simple. Éligible au paiement échelonné Lebalma sur 6 mois.','iPhone 14 Simple',220000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"128 Go\",\"256 Go\"]','[{\"storage\":\"128 Go\",\"price\":220000},{\"storage\":\"256 Go\",\"price\":240000}]','[]','{}',1,0,0,0,1,0,4.6,11,1,'monthly',60,6,1.7,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(11,'iPhone 14 Plus','iphone-14-plus','Apple iPhone 14 Plus. Éligible au paiement échelonné Lebalma sur 6 mois.','iPhone 14 Plus',240000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"128 Go\",\"256 Go\"]','[{\"storage\":\"128 Go\",\"price\":240000},{\"storage\":\"256 Go\",\"price\":260000}]','[]','{}',1,0,0,0,1,0,4.3,24,1,'monthly',60,6,1.7,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(12,'iPhone 14 Pro','iphone-14-pro','Apple iPhone 14 Pro. Éligible au paiement échelonné Lebalma sur 6 mois.','iPhone 14 Pro',300000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"128 Go\",\"256 Go\"]','[{\"storage\":\"128 Go\",\"price\":300000},{\"storage\":\"256 Go\",\"price\":320000}]','[]','{}',1,0,0,1,1,0,4.3,44,1,'monthly',60,6,1.7,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(13,'iPhone 14 Pro Max','iphone-14-pro-max','Apple iPhone 14 Pro Max. Éligible au paiement échelonné Lebalma sur 6 mois.','iPhone 14 Pro Max',320000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"128 Go\",\"256 Go\"]','[{\"storage\":\"128 Go\",\"price\":320000},{\"storage\":\"256 Go\",\"price\":350000}]','[]','{}',1,0,0,0,0,0,4.3,8,1,'monthly',60,6,1.7,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(14,'iPhone 16 Simple','iphone-16-simple','Apple iPhone 16 Simple. Éligible au paiement échelonné Lebalma sur 6 mois.','iPhone 16 Simple',380000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"128 Go\",\"256 Go\"]','[{\"storage\":\"128 Go\",\"price\":380000},{\"storage\":\"256 Go\",\"price\":430000}]','[]','{}',1,0,0,0,1,0,4.2,46,1,'monthly',60,6,1.7,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(15,'iPhone 16 Plus','iphone-16-plus','Apple iPhone 16 Plus. Éligible au paiement échelonné Lebalma sur 6 mois.','iPhone 16 Plus',420000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"128 Go\",\"256 Go\"]','[{\"storage\":\"128 Go\",\"price\":420000},{\"storage\":\"256 Go\",\"price\":450000}]','[]','{}',1,0,0,0,1,0,4.8,31,1,'monthly',60,6,1.7,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(16,'iPhone 16 Pro','iphone-16-pro','Apple iPhone 16 Pro. Éligible au paiement échelonné Lebalma sur 6 mois.','iPhone 16 Pro',430000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"128 Go\",\"256 Go\"]','[{\"storage\":\"128 Go\",\"price\":430000},{\"storage\":\"256 Go\",\"price\":480000}]','[]','{}',1,0,1,0,1,0,4.8,13,1,'monthly',60,6,1.7,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(17,'iPhone 16 Pro Max','iphone-16-pro-max','Apple iPhone 16 Pro Max. Éligible au paiement échelonné Lebalma sur 6 mois.','iPhone 16 Pro Max',540000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"256 Go\"]','[{\"storage\":\"256 Go\",\"price\":540000}]','[]','{}',1,0,0,0,1,0,4.2,24,1,'monthly',60,6,1.7,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(18,'iPhone 17 Air','iphone-17-air','Apple iPhone 17 Air. Éligible au paiement échelonné Lebalma sur 6 mois.','iPhone 17 Air',550000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"256 Go\"]','[{\"storage\":\"256 Go\",\"price\":550000}]','[]','{}',1,0,0,0,1,0,4.8,11,1,'monthly',60,6,1.7,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(19,'iPhone 17 Pro eSIM','iphone-17-pro-esim','Apple iPhone 17 Pro eSIM. Éligible au paiement échelonné Lebalma sur 6 mois.','iPhone 17 Pro eSIM',700000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"256 Go\"]','[{\"storage\":\"256 Go\",\"price\":700000}]','[]','{}',1,0,0,0,1,0,4.6,47,1,'monthly',60,6,1.7,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(20,'iPhone 17 Pro Max eSIM','iphone-17-pro-max-esim','Apple iPhone 17 Pro Max eSIM. Éligible au paiement échelonné Lebalma sur 6 mois.','iPhone 17 Pro Max eSIM',800000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"256 Go\"]','[{\"storage\":\"256 Go\",\"price\":800000}]','[]','{}',1,0,0,0,1,0,4.3,14,1,'monthly',60,6,1.7,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(21,'iPhone 17 Pro SIM','iphone-17-pro-sim','Apple iPhone 17 Pro SIM. Éligible au paiement échelonné Lebalma sur 6 mois.','iPhone 17 Pro SIM',750000,NULL,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"256 Go\"]','[{\"storage\":\"256 Go\",\"price\":750000}]','[]','{}',1,0,0,0,1,0,4.9,43,1,'monthly',60,6,1.7,'2026-07-30 01:51:43','2026-08-06 13:40:07',1),(22,'iPhone 17 Pro Max SIM','iphone-17-pro-max-sim','Apple iPhone 17 Pro Max SIM. Éligible au paiement échelonné Lebalma sur 6 mois.','iPhone 17 Pro Max SIM',900000,1125000,15,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"256 Go\"]','[{\"storage\":\"256 Go\",\"price\":900000}]','[]','{}',1,1,0,0,1,0,4.4,10,1,'monthly',60,6,1.7,'2026-07-30 01:51:43','2026-08-09 01:55:58',1),(23,'iPad Air','ipad-air',NULL,'iPad Air',480000,NULL,6,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"64 Go\",\"256 Go\"]','[]','[]','{}',1,0,0,0,0,0,4.8,33,0,'monthly',0,0,1,'2026-07-30 01:51:43','2026-08-06 13:40:07',2),(24,'MacBook Air M2','macbook-air-m2',NULL,'MacBook Air',900000,NULL,4,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"256 Go\",\"512 Go\"]','[]','[]','{}',1,0,0,0,0,0,4.7,10,0,'monthly',0,0,1,'2026-07-30 01:51:43','2026-08-06 13:40:07',3),(25,'iPhone XR','iphone-xr','Apple iPhone XR. Modèle non éligible au paiement échelonné Lebalma.','iPhone XR',95000,118750,20,'[{\"name\":\"Noir\",\"hex\":\"#1c1c1e\"},{\"name\":\"Blanc\",\"hex\":\"#f5f5f7\"},{\"name\":\"Bleu\",\"hex\":\"#0A84FF\"}]','[\"64 Go\",\"128 Go\",\"256 Go\"]','[{\"storage\":\"64 Go\",\"price\":95000},{\"storage\":\"128 Go\",\"price\":110000},{\"storage\":\"256 Go\",\"price\":125000}]','[\"https://res.cloudinary.com/nepexwaa/image/upload/v1786461124/cheikh-tidiane-apple/products/rlpdj4bse0rbcnx955vy.jpg\",\"https://res.cloudinary.com/nepexwaa/image/upload/v1786461126/cheikh-tidiane-apple/products/dm9xsv5lxvncl3caf3bl.jpg\",\"https://res.cloudinary.com/nepexwaa/image/upload/v1786461127/cheikh-tidiane-apple/products/grscpw0imqjkpblnyck0.jpg\",\"https://res.cloudinary.com/nepexwaa/image/upload/v1786461128/cheikh-tidiane-apple/products/sw7kfbdscnlh0bm08ys7.jpg\",\"https://res.cloudinary.com/nepexwaa/image/upload/v1786461129/cheikh-tidiane-apple/products/usxgiiks3ihokgz6i1py.jpg\"]','{}',0,1,0,0,0,0,4.2,33,0,NULL,0,0,1,'2026-07-31 12:10:08','2026-08-11 15:12:14',1);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return_items`
--

DROP TABLE IF EXISTS `return_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `return_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `returnRequestId` int(11) NOT NULL,
  `orderItemId` int(11) DEFAULT NULL,
  `productName` varchar(255) DEFAULT NULL,
  `unitPrice` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `color` varchar(255) DEFAULT NULL,
  `storage` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `returnRequestId` (`returnRequestId`),
  KEY `orderItemId` (`orderItemId`),
  CONSTRAINT `return_items_ibfk_169` FOREIGN KEY (`returnRequestId`) REFERENCES `return_requests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `return_items_ibfk_170` FOREIGN KEY (`orderItemId`) REFERENCES `order_items` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return_items`
--

LOCK TABLES `return_items` WRITE;
/*!40000 ALTER TABLE `return_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `return_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return_requests`
--

DROP TABLE IF EXISTS `return_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `return_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reference` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('requested','approved','rejected','refunded') DEFAULT 'requested',
  `refundAmount` int(11) DEFAULT 0,
  `adminNote` text DEFAULT NULL,
  `resolvedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  UNIQUE KEY `reference_2` (`reference`),
  UNIQUE KEY `reference_3` (`reference`),
  UNIQUE KEY `reference_4` (`reference`),
  UNIQUE KEY `reference_5` (`reference`),
  UNIQUE KEY `reference_6` (`reference`),
  UNIQUE KEY `reference_7` (`reference`),
  UNIQUE KEY `reference_8` (`reference`),
  KEY `userId` (`userId`),
  KEY `orderId` (`orderId`),
  CONSTRAINT `return_requests_ibfk_171` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `return_requests_ibfk_172` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return_requests`
--

LOCK TABLES `return_requests` WRITE;
/*!40000 ALTER TABLE `return_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `return_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `isApproved` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reviews_user_id_product_id` (`userId`,`productId`),
  KEY `productId` (`productId`),
  CONSTRAINT `reviews_ibfk_293` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reviews_ibfk_294` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,2,25,5,'Excellent produit, livraison rapide !',1,'2026-08-06 13:32:21','2026-08-06 13:32:21'),(2,9,1,5,'Excelent !',1,'2026-08-06 17:02:52','2026-08-06 17:02:52');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `key` varchar(255) NOT NULL,
  `value` longtext DEFAULT '{}',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_alerts`
--

DROP TABLE IF EXISTS `stock_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `notifiedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_alerts_user_id_product_id` (`userId`,`productId`),
  KEY `productId` (`productId`),
  CONSTRAINT `stock_alerts_ibfk_69` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stock_alerts_ibfk_70` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_alerts`
--

LOCK TABLES `stock_alerts` WRITE;
/*!40000 ALTER TABLE `stock_alerts` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` enum('client','admin','superadmin') DEFAULT 'client',
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `isKycVerified` tinyint(1) DEFAULT 0,
  `idDocumentUrl` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `twoFactorEnabled` tinyint(1) DEFAULT 0,
  `twoFactorSecret` varchar(255) DEFAULT NULL,
  `idCardFrontUrl` varchar(255) DEFAULT NULL,
  `idCardBackUrl` varchar(255) DEFAULT NULL,
  `idNin` varchar(255) DEFAULT NULL,
  `idBirthDate` varchar(255) DEFAULT NULL,
  `idExpiryDate` varchar(255) DEFAULT NULL,
  `deliveryZone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Cheikh Tidiane','admin@cheikhtidiane.com','$2a$10$yAv9jU1ug/c0VyvbF8LDf.nPK4BGhx4lOmSlHz2i7/ZRogBbqZ4eq',NULL,'superadmin',NULL,NULL,NULL,1,NULL,'2026-07-30 01:51:42','2026-08-02 21:40:13',1,'JFICM2KWKQVHGUDTI5QVU5DGPBKVAIZQJZ3HKT2OIZTWMY3WIRUQ',NULL,NULL,NULL,NULL,NULL,NULL),(2,'Awa Ndiaye','awa@example.com','$2a$10$zHTJjb3odixmV2F0wUnObOkvsEinnFh952AhrCd.5XzWjJJkrTrrG','+221771112233','client','Gu�diawaye Cit�','Dakar',NULL,1,NULL,'2026-07-31 12:10:06','2026-08-02 23:52:41',0,NULL,NULL,NULL,NULL,NULL,NULL,'pikine-guediawaye'),(3,'Modou Fall','modou@example.com','$2a$10$nMrVrTMX7Xs7jUglyEDJSOhaRfRMnyMkcoLln2R84NhbLqhJ4dPQi','+221770000002','client','Cité Malick Sy','Thiès',NULL,1,NULL,'2026-07-31 12:10:07','2026-07-31 12:10:07',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,'Fatou Sarr','fatou@example.com','$2a$10$PGC.p.t/vPZPzkT2AwOGq.CM0ScFZXK7suZFUMIk22iAdaqyomfwq','+221770000003','client','Liberté 6','Dakar',NULL,0,NULL,'2026-07-31 12:10:07','2026-07-31 12:10:07',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,'Ibrahima Bâ','ibrahima@example.com','$2a$10$QF1ZEmEB6/ajf/R2PkXkkO2q5/d86YRfix85g1DHVOkGD4AJwAqiC','+221770000004','client','Keury Kao','Rufisque',NULL,1,NULL,'2026-07-31 12:10:08','2026-07-31 12:10:08',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,'Aïssatou Diop','aissatou@example.com','$2a$10$McYMc0.3X0E4eCyP6cHOGOTEq.g9FCwStxN/UQR2Z.VHFgaATblfS','+221770000005','client','Point E','Dakar',NULL,1,NULL,'2026-07-31 12:10:08','2026-07-31 12:10:08',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,'Pay Test','pay_test_1785533536340@example.com','$2a$10$DfmC4QH/mbJtGGZdY5SuaunEyii./rCGpOssdDIcyloAOGvDTf1tu','770000000','client',NULL,NULL,NULL,0,NULL,'2026-07-31 21:32:16','2026-07-31 21:32:16',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,'Awa Gestionnaire','manager@cheikhtidiane.com','$2a$10$Ei5YjeNQZaW/0UZxvsDo8O/DMtjDpSwFS62b51RIDp5MIofW8HF0i','+221771112233','admin',NULL,NULL,NULL,1,NULL,'2026-07-31 21:44:59','2026-07-31 22:49:42',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,'aminata traore','aminatat1553@gmail.com','$2a$10$I8.aUIHQr2EpXP/DFccomOTH./w66Ts0f0IvkmMBia6qCpnWcii8a','+221708289273','client','136 rue DK0001N01',NULL,'https://lh3.googleusercontent.com/a/ACg8ocIFLAemONZskP8i_UjGCy-VvAa0cx_qZm7oLXoLCQUkHR1iFg=s96-c',0,NULL,'2026-08-02 21:50:59','2026-08-02 23:55:47',0,NULL,NULL,NULL,NULL,NULL,NULL,'keur-massar-malika'),(10,'Vente au comptoir','comptoir@cheikhtidiane.local','$2a$10$NOjYN5ISe7qhsawXT4q17.biEXPMoXyVbc8znYI0e3d3XfJvHT.cm',NULL,'client',NULL,NULL,NULL,0,NULL,'2026-08-11 12:51:25','2026-08-11 12:51:25',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-13 18:06:11
