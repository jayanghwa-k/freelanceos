-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'progress',
  due_date TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  revenue NUMERIC DEFAULT 0,
  project_count INTEGER DEFAULT 0,
  avatar_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  is_done BOOLEAN DEFAULT false,
  tag TEXT,
  meta TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Seed Data
INSERT INTO projects (name, client, progress, status, due_date, color) VALUES
('쇼핑몰 웹사이트 리뉴얼', '(주)한국패션', 72, 'progress', '3/31', '#7367f0'),
('브랜드 아이덴티티 디자인', '스타트업A', 90, 'review', '3/22', '#28c76f'),
('모바일 앱 UI/UX', '테크벤처B', 45, 'progress', '4/15', '#ff9f43'),
('마케팅 랜딩페이지', '글로벌커머스', 30, 'hold', '5/01', '#00cfe8');

INSERT INTO invoices (invoice_number, client_name, amount, status, date) VALUES
('#INV-024', '(주)한국패션', 1200000, 'pending', '2025-03-19'),
('#INV-023', '스타트업A', 850000, 'sent', '2025-03-18'),
('#INV-022', '테크벤처B', 2100000, 'paid', '2025-03-15'),
('#INV-021', '글로벌커머스', 600000, 'overdue', '2025-03-10');

INSERT INTO clients (name, company, revenue, project_count, avatar_color) VALUES
('김한국', '(주)한국패션', 3200000, 3, 'linear-gradient(135deg,#7367f0,#a78bfa)'),
('이스타', '스타트업A', 1500000, 1, 'linear-gradient(135deg,#28c76f,#48da89)'),
('박테크', '테크벤처B', 4500000, 2, 'linear-gradient(135deg,#ff9f43,#ffc085)');

INSERT INTO tasks (title, is_done, tag, meta) VALUES
('로고 시안 3종 발송', true, '브랜드', '스타트업A'),
('계약서 검토 및 서명', true, '계약', '테크벤처B'),
('메인 배너 디자인 수정', false, '디자인', '(주)한국패션 · 오후 5시 마감'),
('인보이스 #INV-024 발송', false, '인보이스', '오늘 중'),
('앱 와이어프레임 1차 완성', false, 'UI/UX', '테크벤처B · 오늘 중');
