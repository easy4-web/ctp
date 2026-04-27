-- Add gender_split flag to ctp_holes (true = Men/Women categories, false = Open/no category)
alter table ctp_holes add column gender_split boolean default true;

-- Extend gender check constraints to allow 'O' (Open) in addition to 'M' and 'F'
alter table submissions drop constraint if exists submissions_gender_check;
alter table submissions add constraint submissions_gender_check check (gender in ('M', 'F', 'O'));

alter table leaders drop constraint if exists leaders_gender_check;
alter table leaders add constraint leaders_gender_check check (gender in ('M', 'F', 'O'));
