-- ルームテーブル
create table rooms (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  image_url text not null,
  description text,
  status text default 'active' check (status in ('active', 'closed')),
  created_at timestamp with time zone default now()
);

-- コメントテーブル
create table comments (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references rooms(id) on delete cascade not null,
  content text not null,
  color text not null,
  x_position float not null,
  y_position float not null,
  created_at timestamp with time zone default now()
);

-- Realtimeを有効化
alter publication supabase_realtime add table comments;

-- Storage bucket for images
insert into storage.buckets (id, name, public) values ('artwork', 'artwork', true);

-- Storage policy: anyone can read
create policy "Public read" on storage.objects
  for select using (bucket_id = 'artwork');

-- Storage policy: anyone can upload (admin only in production)
create policy "Anyone can upload" on storage.objects
  for insert with check (bucket_id = 'artwork');

-- RLS policies for rooms
alter table rooms enable row level security;
create policy "Anyone can read rooms" on rooms for select using (true);
create policy "Anyone can insert rooms" on rooms for insert with check (true);
create policy "Anyone can update rooms" on rooms for update using (true);

-- RLS policies for comments
alter table comments enable row level security;
create policy "Anyone can read comments" on comments for select using (true);
create policy "Anyone can insert comments" on comments for insert with check (true);
