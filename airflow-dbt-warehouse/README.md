# Airflow + dbt Warehouse

End-to-end data pipeline using Airflow and dbt with BigQuery.

## Architecture
Airflow DAG -> Ingest raw data -> dbt models -> BigQuery warehouse

## How to Run
1. Install dependencies
2. Start Airflow: `docker-compose up`
3. Run DAG
4. Run dbt: `dbt run`

## How to run locally

1. Install dependencies:
```bash
pip install -r airflow/requirements.txt

## Tech Stack
- Python
- Airflow
- dbt
- BigQuery




