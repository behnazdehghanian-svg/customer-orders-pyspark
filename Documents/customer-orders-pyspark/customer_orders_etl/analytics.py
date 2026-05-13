from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum as _sum, count, desc


# Configuration
# ---------------------------
# Cluster version (Dataproc/Hadoop) - uncomment when connecting to real cluster
# DATA_PATH = "./data"  # Change to cloud path for Dataproc later

# Initialize Spark
spark = SparkSession.builder.appName("CustomerOrdersAnalytics").getOrCreate()
# ---------------------------
# Cluster version (Dataproc/Hadoop) - uncomment when connecting to real cluster
# spark = SparkSession.builder \
#     .appName("CustomerOrdersAnalytics") \
#     .master("local[*]")  # Use cluster URL for Dataproc later
#     .getOrCreate()

# Read CSVs
customers = spark.read.csv("./data/customers.csv", header=True, inferSchema=True)
orders = spark.read.csv("./data/orders.csv", header=True, inferSchema=True)
products = spark.read.csv("./data/products.csv", header=True, inferSchema=True)

# ---------------------------
# Cluster-ready paths (commented, use for cloud storage)
# customers = spark.read.csv(f"{DATA_PATH}/customers.csv", header=True, inferSchema=True)
# orders = spark.read.csv(f"{DATA_PATH}/orders.csv", header=True, inferSchema=True)
# products = spark.read.csv(f"{DATA_PATH}/products.csv", header=True, inferSchema=True)

# Join tables
orders_customers = orders.join(customers, on="customer_id", how="left")
full_data = orders_customers.join(products, on="product_id", how="left")

# Compute total price
full_data = full_data.withColumn("total_price", col("quantity") * col("price"))

# --- Analytics ---

# Total spending per customer
print("Total Spending per Customer:")
full_data.groupBy("customer_id", "name").agg(_sum("total_price").alias("total_spent")).show()

# Number of orders per product
print("Number of Orders per Product:")
full_data.groupBy("product_id", "product_name").agg(count("order_id").alias("num_orders")).show()

# Top 3 customers by revenue
print("Top 3 Customers by Revenue:")
full_data.groupBy("customer_id", "name").agg(_sum("total_price").alias("total_spent")) \
    .orderBy(desc("total_spent")) \
    .show(3)
