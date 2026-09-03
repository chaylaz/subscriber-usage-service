-- ============================================================
-- Q3: Subscriber & Usage SQL
-- SQL Dialect: MySQL 8
--
-- Assumption:
-- The provided subscriber IDs run from SUB01 to SUB06.
-- Because the test does not specify an ID for Fajar,
-- SUB07 is used as the next subscriber ID.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Insert a new subscriber named Fajar,
--    Basic plan, activated 24 January 2024.
-- ------------------------------------------------------------

INSERT INTO subscribers (
    id,
    name,
    plan,
    activationDate
)
VALUES (
    'SUB07',
    'Fajar',
    'Basic',
    '2024-01-24'
);


-- ------------------------------------------------------------
-- 2. Update Fajar's plan to Premium.
-- ------------------------------------------------------------

UPDATE subscribers
SET plan = 'Premium'
WHERE id = 'SUB07';


-- ------------------------------------------------------------
-- 3. Calculate the total data usage across all snapshots
--    for all Premium-plan subscribers.
-- ------------------------------------------------------------

SELECT
    SUM(u.dataUsageMB) AS totalPremiumDataUsageMB
FROM subscribers AS s
JOIN `usage` AS u
    ON s.id = u.subscriberId
WHERE s.plan = 'Premium';


-- ------------------------------------------------------------
-- 4. Sort and display the top 3 subscribers by
--    total data usage across all snapshots.
-- ------------------------------------------------------------

SELECT
    s.id AS subscriberId,
    s.name,
    SUM(u.dataUsageMB) AS totalDataUsageMB
FROM subscribers AS s
JOIN `usage` AS u
    ON s.id = u.subscriberId
GROUP BY
    s.id,
    s.name
ORDER BY
    totalDataUsageMB DESC
LIMIT 3;


-- ------------------------------------------------------------
-- 5. Use a subquery to find subscribers whose average
--    call minutes per snapshot is less than or equal to 30.
-- ------------------------------------------------------------

SELECT
    s.id AS subscriberId,
    s.name
FROM subscribers AS s
WHERE s.id IN (
    SELECT
        u.subscriberId
    FROM `usage` AS u
    GROUP BY
        u.subscriberId
    HAVING
        AVG(u.callMinutes) <= 30
);