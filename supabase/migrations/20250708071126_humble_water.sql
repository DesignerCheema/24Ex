/*
  # Increase numeric precision for order financial fields

  1. Changes
    - Increase precision of `total_amount` from numeric(10,2) to numeric(20,2)
    - Increase precision of `delivery_fee` from numeric(10,2) to numeric(20,2)
    - Increase precision of `tax` from numeric(10,2) to numeric(20,2)
    - Increase precision of `discount` from numeric(10,2) to numeric(20,2)

  2. Impact
    - Allows for much larger financial values (up to 999,999,999,999,999,999.99)
    - Prevents numeric field overflow errors when creating/updating orders
    - Maintains 2 decimal places for currency precision
*/

-- Increase precision for all numeric financial fields in orders table
ALTER TABLE public.orders 
  ALTER COLUMN total_amount TYPE numeric(20, 2),
  ALTER COLUMN delivery_fee TYPE numeric(20, 2),
  ALTER COLUMN tax TYPE numeric(20, 2),
  ALTER COLUMN discount TYPE numeric(20, 2);