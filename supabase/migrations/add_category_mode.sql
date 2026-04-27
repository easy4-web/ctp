-- Replace gender_split boolean with a proper category_mode column
alter table ctp_holes drop column if exists gender_split;
alter table ctp_holes add column if not exists category_mode text not null default 'gendered';
alter table ctp_holes drop constraint if exists ctp_holes_category_mode_check;
alter table ctp_holes add constraint ctp_holes_category_mode_check
  check (category_mode in ('gendered', 'open', 'men_only', 'women_only'));
