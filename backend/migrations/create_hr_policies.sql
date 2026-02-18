CREATE TABLE IF NOT EXISTS `hr_policies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `description` text,
  `content` text,
  `doc_no` varchar(255) DEFAULT NULL,
  `version` varchar(255) DEFAULT NULL,
  `effective_date` datetime DEFAULT NULL,
  `prepared_by` varchar(255) DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
