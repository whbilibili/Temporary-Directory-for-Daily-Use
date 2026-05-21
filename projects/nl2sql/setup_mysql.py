"""
setup_mysql.py — 初始化 MySQL 电商示例数据库
运行：python3 setup_mysql.py
"""

import sys
import argparse

def setup(host="127.0.0.1", port=3306, user="root", password="", db_name="nl2sql_shop"):
    try:
        import pymysql
    except ImportError:
        print("❌ 缺少 pymysql，请先运行：pip3 install pymysql")
        sys.exit(1)

    # 先不指定数据库，创建库
    conn = pymysql.connect(
        host=host, port=port, user=user, password=password,
        charset="utf8mb4", connect_timeout=10,
    )
    cursor = conn.cursor()

    print(f"🔧 创建数据库 `{db_name}`...")
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    cursor.execute(f"USE `{db_name}`")

    print("📋 创建表结构...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS `users` (
            `id`         INT AUTO_INCREMENT PRIMARY KEY,
            `name`       VARCHAR(50)  NOT NULL COMMENT '用户姓名',
            `email`      VARCHAR(100) UNIQUE COMMENT '邮箱',
            `city`       VARCHAR(50)  COMMENT '所在城市',
            `gender`     TINYINT(1)   DEFAULT 1 COMMENT '性别 1男 0女',
            `age`        INT          COMMENT '年龄',
            `created_at` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
            INDEX idx_city (`city`)
        ) ENGINE=InnoDB COMMENT='用户表';
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS `categories` (
            `id`   INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
            `parent_id` INT DEFAULT 0 COMMENT '父分类ID'
        ) ENGINE=InnoDB COMMENT='商品分类';
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS `products` (
            `id`          INT AUTO_INCREMENT PRIMARY KEY,
            `name`        VARCHAR(100) NOT NULL COMMENT '商品名称',
            `category_id` INT          COMMENT '分类ID',
            `price`       DECIMAL(10,2) NOT NULL COMMENT '售价',
            `cost`        DECIMAL(10,2) COMMENT '成本价',
            `stock`       INT DEFAULT 0 COMMENT '库存',
            `sales`       INT DEFAULT 0 COMMENT '累计销量',
            `status`      TINYINT DEFAULT 1 COMMENT '状态 1上架 0下架',
            `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_category (`category_id`),
            INDEX idx_status (`status`)
        ) ENGINE=InnoDB COMMENT='商品表';
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS `orders` (
            `id`          INT AUTO_INCREMENT PRIMARY KEY,
            `order_no`    VARCHAR(32) UNIQUE COMMENT '订单号',
            `user_id`     INT NOT NULL COMMENT '用户ID',
            `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
            `pay_amount`  DECIMAL(10,2) COMMENT '实付金额',
            `status`      VARCHAR(20) DEFAULT 'pending' COMMENT 'pending/paid/shipped/completed/cancelled',
            `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
            `paid_at`     DATETIME COMMENT '支付时间',
            INDEX idx_user (`user_id`),
            INDEX idx_status (`status`),
            INDEX idx_created (`created_at`)
        ) ENGINE=InnoDB COMMENT='订单主表';
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS `order_items` (
            `id`          INT AUTO_INCREMENT PRIMARY KEY,
            `order_id`    INT NOT NULL COMMENT '订单ID',
            `product_id`  INT NOT NULL COMMENT '商品ID',
            `quantity`    INT NOT NULL COMMENT '购买数量',
            `unit_price`  DECIMAL(10,2) NOT NULL COMMENT '下单时单价',
            `subtotal`    DECIMAL(10,2) NOT NULL COMMENT '小计',
            INDEX idx_order (`order_id`),
            INDEX idx_product (`product_id`)
        ) ENGINE=InnoDB COMMENT='订单明细表';
    """)

    print("📦 写入示例数据...")

    # 分类
    cursor.execute("DELETE FROM `order_items`")
    cursor.execute("DELETE FROM `orders`")
    cursor.execute("DELETE FROM `products`")
    cursor.execute("DELETE FROM `categories`")
    cursor.execute("DELETE FROM `users`")
    cursor.execute("ALTER TABLE `users` AUTO_INCREMENT = 1")
    cursor.execute("ALTER TABLE `categories` AUTO_INCREMENT = 1")
    cursor.execute("ALTER TABLE `products` AUTO_INCREMENT = 1")
    cursor.execute("ALTER TABLE `orders` AUTO_INCREMENT = 1")
    cursor.execute("ALTER TABLE `order_items` AUTO_INCREMENT = 1")

    cursor.executemany(
        "INSERT INTO `categories` (`name`, `parent_id`) VALUES (%s, %s)",
        [("手机数码", 0), ("电脑办公", 0), ("家用电器", 0),
         ("智能手机", 1), ("平板电脑", 1), ("笔记本电脑", 2),
         ("键鼠外设", 2), ("空调", 3), ("冰箱", 3)]
    )

    # 用户
    cursor.executemany(
        "INSERT INTO `users` (`name`,`email`,`city`,`gender`,`age`,`created_at`) VALUES (%s,%s,%s,%s,%s,%s)",
        [
            ("张三",   "zhangsan@example.com", "北京", 1, 28, "2023-06-01 10:00:00"),
            ("李四",   "lisi@example.com",     "上海", 1, 35, "2023-07-15 14:00:00"),
            ("王五",   "wangwu@example.com",   "北京", 1, 22, "2023-08-20 09:00:00"),
            ("赵六",   "zhaoliu@example.com",  "广州", 0, 30, "2023-09-10 11:00:00"),
            ("孙七",   "sunqi@example.com",    "深圳", 0, 26, "2023-10-05 16:00:00"),
            ("周八",   "zhouba@example.com",   "上海", 1, 40, "2023-11-01 08:00:00"),
            ("吴九",   "wujiu@example.com",    "北京", 0, 33, "2024-01-10 13:00:00"),
            ("郑十",   "zhengshi@example.com", "杭州", 1, 29, "2024-02-14 10:00:00"),
        ]
    )

    # 商品
    cursor.executemany(
        "INSERT INTO `products` (`name`,`category_id`,`price`,`cost`,`stock`,`sales`,`status`) VALUES (%s,%s,%s,%s,%s,%s,%s)",
        [
            ("iPhone 15 Pro",    4,  8999.00, 5500.00,  80, 320, 1),
            ("iPhone 15",        4,  5999.00, 3800.00, 120, 580, 1),
            ("华为 Mate 60 Pro", 4,  6999.00, 4200.00,  60, 210, 1),
            ("小米 14",          4,  3999.00, 2400.00, 200, 450, 1),
            ("iPad Pro 12.9",    5,  8499.00, 5200.00,  40, 130, 1),
            ("MacBook Pro 14",   6, 14999.00, 9500.00,  30, 180, 1),
            ("联想 ThinkPad X1", 6,  9999.00, 6200.00,  50, 95,  1),
            ("罗技 MX Master 3", 7,   699.00,  320.00, 300, 860, 1),
            ("机械键盘 K3 Pro",  7,   599.00,  280.00, 250, 720, 1),
            ("格力空调 1.5P",    8,  3299.00, 1900.00,  70, 240, 1),
            ("海尔冰箱 500L",    9,  4599.00, 2700.00,  45, 160, 1),
            ("AirPods Pro 2",    4,  1899.00, 1100.00, 180, 950, 1),
        ]
    )

    # 订单（跨越 2024 全年 + 2025 年初）
    orders_data = [
        ("ORD20240101001", 1, 8999.00, 8999.00, "completed", "2024-01-05 10:00:00", "2024-01-05 10:05:00"),
        ("ORD20240115001", 2, 14999.00,14999.00,"completed", "2024-01-15 14:00:00", "2024-01-15 14:10:00"),
        ("ORD20240201001", 3, 5999.00, 5699.00, "completed", "2024-02-01 09:00:00", "2024-02-01 09:08:00"),
        ("ORD20240210001", 1, 1899.00, 1899.00, "completed", "2024-02-10 11:00:00", "2024-02-10 11:03:00"),
        ("ORD20240301001", 4, 3999.00, 3799.00, "completed", "2024-03-05 16:00:00", "2024-03-05 16:12:00"),
        ("ORD20240315001", 5, 8499.00, 8499.00, "completed", "2024-03-15 10:00:00", "2024-03-15 10:06:00"),
        ("ORD20240401001", 2, 699.00,  699.00,  "completed", "2024-04-01 13:00:00", "2024-04-01 13:02:00"),
        ("ORD20240420001", 6, 9999.00, 9499.00, "completed", "2024-04-20 09:00:00", "2024-04-20 09:15:00"),
        ("ORD20240501001", 3, 6999.00, 6999.00, "completed", "2024-05-01 10:00:00", "2024-05-01 10:08:00"),
        ("ORD20240520001", 7, 3299.00, 3299.00, "completed", "2024-05-20 14:00:00", "2024-05-20 14:05:00"),
        ("ORD20240601001", 1, 599.00,  599.00,  "completed", "2024-06-01 11:00:00", "2024-06-01 11:01:00"),
        ("ORD20240615001", 4, 4599.00, 4599.00, "completed", "2024-06-15 16:00:00", "2024-06-15 16:10:00"),
        ("ORD20240701001", 8, 8999.00, 8999.00, "completed", "2024-07-01 10:00:00", "2024-07-01 10:05:00"),
        ("ORD20240715001", 2, 5999.00, 5699.00, "completed", "2024-07-15 14:00:00", "2024-07-15 14:08:00"),
        ("ORD20240801001", 5, 1899.00, 1899.00, "completed", "2024-08-01 09:00:00", "2024-08-01 09:03:00"),
        ("ORD20240820001", 3, 14999.00,14999.00,"completed", "2024-08-20 11:00:00", "2024-08-20 11:12:00"),
        ("ORD20240901001", 6, 3999.00, 3799.00, "completed", "2024-09-01 10:00:00", "2024-09-01 10:06:00"),
        ("ORD20240915001", 1, 8499.00, 8499.00, "completed", "2024-09-15 14:00:00", "2024-09-15 14:07:00"),
        ("ORD20241001001", 7, 699.00,  699.00,  "completed", "2024-10-01 09:00:00", "2024-10-01 09:02:00"),
        ("ORD20241020001", 4, 9999.00, 9499.00, "completed", "2024-10-20 11:00:00", "2024-10-20 11:15:00"),
        ("ORD20241101001", 2, 6999.00, 6999.00, "completed", "2024-11-01 10:00:00", "2024-11-01 10:08:00"),
        ("ORD20241115001", 8, 4599.00, 4599.00, "completed", "2024-11-15 14:00:00", "2024-11-15 14:10:00"),
        ("ORD20241201001", 1, 599.00,  599.00,  "completed", "2024-12-01 11:00:00", "2024-12-01 11:01:00"),
        ("ORD20241215001", 5, 8999.00, 8999.00, "completed", "2024-12-15 16:00:00", "2024-12-15 16:05:00"),
        ("ORD20241220001", 3, 1899.00, 1899.00, "pending",   "2024-12-20 10:00:00", None),
        ("ORD20250101001", 6, 14999.00,14999.00,"paid",      "2025-01-01 10:00:00", "2025-01-01 10:10:00"),
        ("ORD20250110001", 2, 3999.00, 3799.00, "shipped",   "2025-01-10 14:00:00", "2025-01-10 14:05:00"),
        ("ORD20250115001", 7, 8499.00, 8499.00, "cancelled", "2025-01-15 09:00:00", None),
    ]
    cursor.executemany(
        "INSERT INTO `orders` (`order_no`,`user_id`,`total_amount`,`pay_amount`,`status`,`created_at`,`paid_at`) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s)",
        orders_data
    )

    # 订单明细（每个订单 1-2 个商品）
    items_data = [
        (1,  1,  1, 8999.00, 8999.00),
        (2,  6,  1,14999.00,14999.00),
        (3,  2,  1, 5999.00, 5999.00),
        (4, 12,  1, 1899.00, 1899.00),
        (5,  4,  1, 3999.00, 3999.00),
        (6,  5,  1, 8499.00, 8499.00),
        (7,  8,  1,  699.00,  699.00),
        (8,  7,  1, 9999.00, 9999.00),
        (9,  3,  1, 6999.00, 6999.00),
        (10,10,  1, 3299.00, 3299.00),
        (11, 9,  1,  599.00,  599.00),
        (12,11,  1, 4599.00, 4599.00),
        (13, 1,  1, 8999.00, 8999.00),
        (14, 2,  1, 5999.00, 5999.00),
        (15,12,  1, 1899.00, 1899.00),
        (16, 6,  1,14999.00,14999.00),
        (17, 4,  1, 3999.00, 3999.00),
        (18, 5,  1, 8499.00, 8499.00),
        (19, 8,  1,  699.00,  699.00),
        (20, 7,  1, 9999.00, 9999.00),
        (21, 3,  1, 6999.00, 6999.00),
        (22,11,  1, 4599.00, 4599.00),
        (23, 9,  1,  599.00,  599.00),
        (24, 1,  1, 8999.00, 8999.00),
        (25,12,  1, 1899.00, 1899.00),
        (26, 6,  1,14999.00,14999.00),
        (27, 4,  1, 3999.00, 3999.00),
        (28, 5,  1, 8499.00, 8499.00),
    ]
    cursor.executemany(
        "INSERT INTO `order_items` (`order_id`,`product_id`,`quantity`,`unit_price`,`subtotal`) "
        "VALUES (%s,%s,%s,%s,%s)",
        items_data
    )

    conn.commit()

    # 统计
    cursor.execute("SELECT COUNT(*) FROM users")
    u = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM products")
    p = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM orders")
    o = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM order_items")
    oi = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    print(f"\n✅ 数据库 `{db_name}` 初始化完成！")
    print(f"   users:       {u} 条")
    print(f"   products:    {p} 条")
    print(f"   orders:      {o} 条")
    print(f"   order_items: {oi} 条")
    print(f"\n🚀 现在可以运行：")
    print(f"   python3 nl2sql.py --mysql --mysql-db {db_name}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="初始化 MySQL 电商示例数据库")
    parser.add_argument("--host",     default="127.0.0.1")
    parser.add_argument("--port",     type=int, default=3306)
    parser.add_argument("--user",     default="root")
    parser.add_argument("--password", default="")
    parser.add_argument("--db",       default="nl2sql_shop")
    args = parser.parse_args()

    setup(args.host, args.port, args.user, args.password, args.db)
