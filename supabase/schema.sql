-- CTP App Schema
-- Run this in the Supabase SQL editor

-- Tournaments
create table tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- CTP Holes (baskets designated as CTP for a tournament)
create table ctp_holes (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade,
  hole_number int not null,
  sponsor_name text,
  active boolean default true,
  created_at timestamptz default now(),
  unique(tournament_id, hole_number)
);

-- Submissions (full history)
create table submissions (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade,
  hole_id uuid references ctp_holes(id) on delete cascade,
  player_name text not null,
  gender text check (gender in ('M', 'F')) not null,
  distance_m numeric(8,2) not null,
  device_id text not null,
  created_at timestamptz default now(),
  unique(hole_id, gender, device_id)
);

-- Leaders (fast-read cache of current best per hole per gender)
create table leaders (
  hole_id uuid references ctp_holes(id) on delete cascade,
  gender text check (gender in ('M', 'F')) not null,
  player_name text not null,
  distance_m numeric(8,2) not null,
  submission_id uuid references submissions(id),
  updated_at timestamptz default now(),
  primary key (hole_id, gender)
);

-- Function: recalculate leader for a hole+gender after any submission change
create or replace function recalculate_leader(p_hole_id uuid, p_gender text)
returns void as $$
declare
  v_best record;
begin
  select player_name, distance_m, id into v_best
  from submissions
  where hole_id = p_hole_id and gender = p_gender
  order by distance_m asc
  limit 1;

  if found then
    insert into leaders (hole_id, gender, player_name, distance_m, submission_id, updated_at)
    values (p_hole_id, p_gender, v_best.player_name, v_best.distance_m, v_best.id, now())
    on conflict (hole_id, gender) do update
    set player_name = excluded.player_name,
        distance_m = excluded.distance_m,
        submission_id = excluded.submission_id,
        updated_at = now();
  end if;
end;
$$ language plpgsql;

-- Trigger: fires after every insert or update on submissions
create or replace function trigger_recalculate_leader()
returns trigger as $$
begin
  perform recalculate_leader(NEW.hole_id, NEW.gender);
  return NEW;
end;
$$ language plpgsql;

create trigger on_submission_change
  after insert or update on submissions
  for each row execute function trigger_recalculate_leader();

-- Enable realtime on leaders table
alter publication supabase_realtime add table leaders;
