from pyspark.sql import SparkSession
from pyspark.sql.functions import col

# ---------------------------
# Configuration
# ---------------------------
# DATA_PATH = "./data"  # Change to cloud path for Dataproc later

# Initialize Spark
spark = SparkSession.builder.appName("CustomerOrdersTransform").getOrCreate()

# ---------------------------
# spark = SparkSession.builder \
#     .appName("CustomerOrdersTransform") \
#     .master("local[*]")  # Use cluster URL for Dataproc later
#     .getOrCreate()

# Read CSVs
customers = spark.read.csv("./data/customers.csv", header=True, inferSchema=True)
orders = spark.read.csv("./data/orders.csv", header=True, inferSchema=True)
products = spark.read.csv("./data/products.csv", header=True, inferSchema=True)
# Load CSV files
# ---------------------------
# customers = spark.read.csv(f"{DATA_PATH}/customers.csv", header=True, inferSchema=True)
# orders = spark.read.csv(f"{DATA_PATH}/orders.csv", header=True, inferSchema=True)
# products = spark.read.csv(f"{DATA_PATH}/products.csv", header=True, inferSchema=True)


# Join orders with customers
orders_customers = orders.join(customers, on="customer_id", how="left")

# Join with products
full_data = orders_customers.join(products, on="product_id", how="left")

# Compute total price
full_data = full_data.withColumn("total_price", col("quantity") * col("price"))

# Show transformed data
full_data.show()
# ---------------------------
# Transform Data
# ---------------------------
# orders_customers = orders.join(customers, on="customer_id", how="left")
# full_orders = orders_customers.join(products, on="product_id", how="left")

# # Compute total price per order
# full_orders = full_orders.withColumn("total_price", col("quantity") * col("price"))

# # Show transformed table
# full_orders.show()
# print("[INFO] Transformation completed successfully.")