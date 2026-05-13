with sales as (
    select *
    from {{ ref('sample_data') }}
)
select *
from sales
