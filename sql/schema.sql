CREATE TABLE IF NOT EXISTS subscribers (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    plan VARCHAR(20) NOT NULL,
    activationDate DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS `usage` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subscriberId VARCHAR(10) NOT NULL,
    callMinutes INT NOT NULL,
    smsCount INT NOT NULL,
    dataUsageMB INT NOT NULL,
    timestamp DATETIME NOT NULL,

    CONSTRAINT fk_usage_subscriber
        FOREIGN KEY (subscriberId)
        REFERENCES subscribers(id)
);