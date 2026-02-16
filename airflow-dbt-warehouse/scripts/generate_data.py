import pandas as pd
import os

dbt_data_path = os.path.join(os.path.dirname(__file__), "../dbt/data")
os.makedirs(dbt_data_path, exist_ok=True)

# Sample customer data
customers = pd.DataFrame({
    "customer_id": [1, 2, 3],
    "name": ["Alice", "Bob", "Charlie"]
})
customers.to_csv(os.path.join(dbt_data_path, "sample_data.csv"), index=False)

# Sample sales data
sales = pd.DataFrame({
    "sale_id": [101, 102, 103],
    "customer_id": [1, 2, 3],
    "amount": [100, 150, 200]
})
sales.to_csv(os.path.join(dbt_data_path, "sample_sales.csv"), index=False)

print("Mock data generated in dbt/data/")
