from pyspark.sql import SparkSession

# ---------------------------
# Configuration
# ---------------------------
#DATA_PATH = "./data"  # Change to cloud path (e.g., gs://bucket) for Dataproc

# Initialize Spark
spark = SparkSession.builder.appName("CustomerOrdersIngest").getOrCreate()
# ---------------------------
# spark = SparkSession.builder \
#     .appName("CustomerOrdersIngest") \
#     .master("local[*]")  # Use cluster URL for Dataproc later
#     .getOrCreate()

# Read CSV files
customers = spark.read.csv("./data/customers.csv", header=True, inferSchema=True)
orders = spark.read.csv("./data/orders.csv", header=True, inferSchema=True)
products = spark.read.csv("./data/products.csv", header=True, inferSchema=True)

# ---------------------------
# customers = spark.read.csv(f"{DATA_PATH}/customers.csv", header=True, inferSchema=True)
# orders = spark.read.csv(f"{DATA_PATH}/orders.csv", header=True, inferSchema=True)
# products = spark.read.csv(f"{DATA_PATH}/products.csv", header=True, inferSchema=True)

# Print row counts
print(f"Customers: {customers.count()} rows")
print(f"Orders: {orders.count()} rows")
print(f"Products: {products.count()} rows")

# ---------------------------
# print(f"[INFO] Loaded {customers.count()} customers")
# print(f"[INFO] Loaded {orders.count()} orders")
# print(f"[INFO] Loaded {products.count()} products")

# print("[INFO] Ingestion completed successfully.")

