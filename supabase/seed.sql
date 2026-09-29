-- Placeholder catalogue: the nine products that used to live in
-- lib/products.ts, each with two amounts. Replace with the real range.
--
-- Safe to re-run: existing slugs and SKUs are left alone.

insert into public.products (slug, name, spec, badge, sort) values
  ('peptide-a', 'Peptide A', 'Lyophilized · ≥99%', 'new',      10),
  ('peptide-b', 'Peptide B', 'Lyophilized · ≥99%', null,       20),
  ('peptide-c', 'Peptide C', 'Lyophilized · ≥98%', null,       30),
  ('peptide-d', 'Peptide D', 'Lyophilized · ≥99%', 'lowStock', 40),
  ('peptide-e', 'Peptide E', 'Lyophilized · ≥99%', null,       50),
  ('peptide-f', 'Peptide F', 'Lyophilized · ≥98%', null,       60),
  ('peptide-g', 'Peptide G', 'Lyophilized · ≥99%', null,       70),
  ('peptide-h', 'Peptide H', 'Lyophilized · ≥99%', 'new',      80),
  ('peptide-i', 'Peptide I', 'Lyophilized · ≥98%', null,       90)
on conflict (slug) do nothing;

-- The smaller amount keeps the old price; the larger one costs about 1.8×.
insert into public.product_variants (product_id, sku, label, price_cents, stock, sort)
select p.id, v.sku, v.label, v.price_cents, v.stock, v.sort
from (values
  ('peptide-a', 'PA-5MG',  '5 mg',  2990, 50, 10),
  ('peptide-a', 'PA-10MG', '10 mg', 5390, 30, 20),
  ('peptide-b', 'PB-5MG',  '5 mg',  3490, 50, 10),
  ('peptide-b', 'PB-10MG', '10 mg', 6290, 30, 20),
  ('peptide-c', 'PC-10MG', '10 mg', 4490, 50, 10),
  ('peptide-c', 'PC-20MG', '20 mg', 8090, 30, 20),
  ('peptide-d', 'PD-2MG',  '2 mg',  2490,  5, 10),
  ('peptide-d', 'PD-5MG',  '5 mg',  4490,  3, 20),
  ('peptide-e', 'PE-5MG',  '5 mg',  3990, 50, 10),
  ('peptide-e', 'PE-10MG', '10 mg', 7190, 30, 20),
  ('peptide-f', 'PF-10MG', '10 mg', 4990, 50, 10),
  ('peptide-f', 'PF-20MG', '20 mg', 8990, 30, 20),
  ('peptide-g', 'PG-5MG',  '5 mg',  3290, 50, 10),
  ('peptide-g', 'PG-10MG', '10 mg', 5890, 30, 20),
  ('peptide-h', 'PH-10MG', '10 mg', 5490, 50, 10),
  ('peptide-h', 'PH-20MG', '20 mg', 9890, 30, 20),
  ('peptide-i', 'PI-2MG',  '2 mg',  2790, 50, 10),
  ('peptide-i', 'PI-5MG',  '5 mg',  4990, 30, 20)
) as v (slug, sku, label, price_cents, stock, sort)
join public.products p on p.slug = v.slug
on conflict (sku) do nothing;
