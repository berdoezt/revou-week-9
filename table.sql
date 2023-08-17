-- revou.`order` definition
CREATE TABLE `order` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `person_id` bigint NOT NULL,
    `price` double NOT NULL,
    `product` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 12 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- revou.person definition
CREATE TABLE `person` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `name` varchar(255) DEFAULT NULL,
    `gender` varchar(100) DEFAULT NULL,
    `department` varchar(100) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `person_name_IDX` (`name`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 25 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;