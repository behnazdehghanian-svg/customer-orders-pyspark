from airflow import DAG
from airflow.operators.python import PythonOperator  # correct for 2.7+
from datetime import datetime
import subprocess
import os

def run_dbt_models():
    dbt_path = os.path.join(os.path.dirname(__file__), "../../dbt")
    subprocess.run(["dbt", "run"], cwd=dbt_path)

def run_dbt_tests():
    dbt_path = os.path.join(os.path.dirname(__file__), "../../dbt")
    subprocess.run(["dbt", "test"], cwd=dbt_path)

with DAG(
    "ingest_transform_dag",
    start_date=datetime(2026, 2, 3),
    schedule_interval="@daily",
    catchup=False,
) as dag:

    run_models = PythonOperator(
        task_id="run_dbt_models",
        python_callable=run_dbt_models
    )

    run_tests = PythonOperator(
        task_id="run_dbt_tests",
        python_callable=run_dbt_tests
    )

    run_models >> run_tests
