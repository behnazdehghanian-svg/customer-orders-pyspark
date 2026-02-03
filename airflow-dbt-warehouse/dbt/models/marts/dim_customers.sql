with customers as (
    select customer_id, name
    from {{ ref('sample_data') }}
)
select *
from customers
