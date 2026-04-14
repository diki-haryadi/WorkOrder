/*
  # Add Master Products/Services and Work Order Items

  ## New tables
  - master_products_services: master katalog produk/jasa bengkel
  - work_order_items: detail item komponen/jasa per work order

  ## Security
  - RLS enabled
  - Anon role allowed full CRUD (consistent with current demo setup)
*/

CREATE TABLE IF NOT EXISTS master_products_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('product', 'service')),
  category text NOT NULL DEFAULT '',
  default_price numeric NOT NULL DEFAULT 0 CHECK (default_price >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS work_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  master_product_service_id uuid REFERENCES master_products_services(id) ON DELETE SET NULL,
  item_name_snapshot text NOT NULL DEFAULT '',
  qty numeric NOT NULL DEFAULT 1 CHECK (qty > 0),
  price numeric NOT NULL DEFAULT 0 CHECK (price >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_master_products_services_kind_active
  ON master_products_services(kind, is_active);

CREATE INDEX IF NOT EXISTS idx_work_order_items_work_order_id
  ON work_order_items(work_order_id);

CREATE INDEX IF NOT EXISTS idx_work_order_items_master_product_service_id
  ON work_order_items(master_product_service_id);

ALTER TABLE master_products_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can select master_products_services"
  ON master_products_services FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can insert master_products_services"
  ON master_products_services FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update master_products_services"
  ON master_products_services FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Anon can delete master_products_services"
  ON master_products_services FOR DELETE TO anon
  USING (true);

CREATE POLICY "Anon can select work_order_items"
  ON work_order_items FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can insert work_order_items"
  ON work_order_items FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update work_order_items"
  ON work_order_items FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Anon can delete work_order_items"
  ON work_order_items FOR DELETE TO anon
  USING (true);

INSERT INTO master_products_services (code, name, kind, category, default_price)
VALUES
  -- Jasa diagnosa & inspeksi
  ('SV-DIAG-SCAN', 'Scan OBD Komputer', 'service', 'Diagnosa', 150000),
  ('SV-DIAG-ENGINE', 'Diagnosa Mesin Menyeluruh', 'service', 'Diagnosa', 250000),
  ('SV-DIAG-AC', 'Diagnosa Sistem AC', 'service', 'Diagnosa', 120000),
  ('SV-DIAG-ELEC', 'Diagnosa Kelistrikan', 'service', 'Diagnosa', 200000),
  ('SV-INSPEKSI-UMUM', 'Inspeksi Umum 30 Titik', 'service', 'Diagnosa', 180000),
  ('SV-INSPEKSI-BELI', 'Inspeksi Pra-Beli Kendaraan', 'service', 'Diagnosa', 450000),

  -- Jasa servis berkala
  ('SV-SERVIS-RINGAN', 'Servis Ringan', 'service', 'Servis Berkala', 350000),
  ('SV-SERVIS-BERKALA', 'Servis Berkala 10.000 km', 'service', 'Servis Berkala', 550000),
  ('SV-SERVIS-BESAR', 'Servis Besar 40.000 km', 'service', 'Servis Berkala', 1500000),
  ('SV-TUNEUP', 'Tune Up Mesin', 'service', 'Servis Berkala', 450000),
  ('SV-FLUSH-ENGINE', 'Engine Flush', 'service', 'Servis Berkala', 180000),
  ('SV-RESET-SERVICE', 'Reset Service Indicator', 'service', 'Servis Berkala', 50000),

  -- Oli & fluida
  ('PR-OLI-5W30-1L', 'Oli Mesin Synthetic 5W-30 (1L)', 'product', 'Oli & Fluida', 180000),
  ('PR-OLI-10W40-1L', 'Oli Mesin Synthetic Blend 10W-40 (1L)', 'product', 'Oli & Fluida', 120000),
  ('PR-OLI-ATF-1L', 'Oli Transmisi ATF (1L)', 'product', 'Oli & Fluida', 140000),
  ('PR-OLI-MTF-1L', 'Oli Transmisi Manual (1L)', 'product', 'Oli & Fluida', 130000),
  ('PR-OLI-GARDAN-1L', 'Oli Gardan (1L)', 'product', 'Oli & Fluida', 125000),
  ('PR-MINYAK-REM-500', 'Minyak Rem DOT4 (500ml)', 'product', 'Oli & Fluida', 85000),
  ('PR-COOLANT-1L', 'Coolant Radiator (1L)', 'product', 'Oli & Fluida', 75000),
  ('PR-PS-FLUID-1L', 'Power Steering Fluid (1L)', 'product', 'Oli & Fluida', 95000),
  ('PR-WW-FLUID-1L', 'Washer Fluid (1L)', 'product', 'Oli & Fluida', 30000),
  ('PR-AC-FLUSH', 'AC Flush Fluid', 'product', 'Oli & Fluida', 60000),

  -- Filter
  ('PR-FILTER-OLI', 'Filter Oli Mesin', 'product', 'Filter', 80000),
  ('PR-FILTER-UDARA', 'Filter Udara Mesin', 'product', 'Filter', 95000),
  ('PR-FILTER-AC', 'Filter Cabin AC', 'product', 'Filter', 85000),
  ('PR-FILTER-BBM', 'Filter Bahan Bakar', 'product', 'Filter', 120000),
  ('PR-FILTER-TRANSMISI', 'Filter Transmisi Otomatis', 'product', 'Filter', 220000),

  -- Rem
  ('PR-KAMPAS-REM-DEPAN', 'Kampas Rem Depan', 'product', 'Sistem Rem', 450000),
  ('PR-KAMPAS-REM-BELAKANG', 'Kampas Rem Belakang', 'product', 'Sistem Rem', 400000),
  ('PR-CAKRAM-REM-DEPAN', 'Cakram Rem Depan', 'product', 'Sistem Rem', 950000),
  ('PR-CAKRAM-REM-BELAKANG', 'Cakram Rem Belakang', 'product', 'Sistem Rem', 850000),
  ('PR-CALIPER-KIT', 'Caliper Repair Kit', 'product', 'Sistem Rem', 280000),
  ('PR-SENSOR-ABS', 'Sensor ABS', 'product', 'Sistem Rem', 700000),
  ('SV-BUBUT-CAKRAM', 'Bubut Cakram', 'service', 'Sistem Rem', 250000),
  ('SV-SERVIS-CALIPER', 'Servis Caliper Rem', 'service', 'Sistem Rem', 300000),
  ('SV-BLEEDING-REM', 'Bleeding Sistem Rem', 'service', 'Sistem Rem', 150000),

  -- Ban, velg & balancing
  ('PR-BAN-185-65-R15', 'Ban 185/65 R15', 'product', 'Ban & Velg', 850000),
  ('PR-BAN-195-65-R15', 'Ban 195/65 R15', 'product', 'Ban & Velg', 980000),
  ('PR-BAN-205-55-R16', 'Ban 205/55 R16', 'product', 'Ban & Velg', 1250000),
  ('PR-BAN-225-45-R17', 'Ban 225/45 R17', 'product', 'Ban & Velg', 1650000),
  ('PR-PENTIL-BAN', 'Pentil Ban', 'product', 'Ban & Velg', 30000),
  ('SV-TAMBAL-BAN', 'Tambal Ban Tubeless', 'service', 'Ban & Velg', 40000),
  ('SV-BALANCING', 'Wheel Balancing', 'service', 'Ban & Velg', 120000),
  ('SV-SPOORING', 'Spooring 4 Roda', 'service', 'Ban & Velg', 250000),
  ('SV-ROTASI-BAN', 'Rotasi Ban', 'service', 'Ban & Velg', 80000),
  ('SV-NITROGEN', 'Isi Nitrogen 4 Ban', 'service', 'Ban & Velg', 50000),

  -- Suspensi & kaki-kaki
  ('PR-SHOCKBREAKER-DEPAN', 'Shockbreaker Depan', 'product', 'Suspensi', 1200000),
  ('PR-SHOCKBREAKER-BELAKANG', 'Shockbreaker Belakang', 'product', 'Suspensi', 950000),
  ('PR-LINK-STABILIZER', 'Link Stabilizer', 'product', 'Suspensi', 250000),
  ('PR-BUSH-ARM', 'Bushing Arm', 'product', 'Suspensi', 180000),
  ('PR-BALL-JOINT', 'Ball Joint', 'product', 'Suspensi', 300000),
  ('PR-TIE-ROD-END', 'Tie Rod End', 'product', 'Suspensi', 260000),
  ('PR-RACK-END', 'Rack End', 'product', 'Suspensi', 290000),
  ('PR-WHEEL-BEARING', 'Wheel Bearing', 'product', 'Suspensi', 380000),
  ('SV-SERVIS-KAKI', 'Servis Kaki-kaki', 'service', 'Suspensi', 450000),
  ('SV-GANTI-SHOCK', 'Jasa Ganti Shockbreaker', 'service', 'Suspensi', 300000),

  -- Mesin & pengapian
  ('PR-BUSI-IRIDIUM', 'Busi Iridium', 'product', 'Mesin', 125000),
  ('PR-COIL-IGNITION', 'Ignition Coil', 'product', 'Mesin', 650000),
  ('PR-INJECTOR', 'Injector Bahan Bakar', 'product', 'Mesin', 850000),
  ('PR-THROTTLE-BODY-CLEANER', 'Throttle Body Cleaner', 'product', 'Mesin', 95000),
  ('PR-TIMING-BELT-KIT', 'Timing Belt Kit', 'product', 'Mesin', 1750000),
  ('PR-FAN-BELT', 'Fan Belt', 'product', 'Mesin', 250000),
  ('PR-GASKET-HEAD', 'Gasket Cylinder Head', 'product', 'Mesin', 600000),
  ('PR-POMPA-BENSIN', 'Pompa Bensin', 'product', 'Mesin', 980000),
  ('PR-POMPA-AIR', 'Water Pump', 'product', 'Mesin', 750000),
  ('SV-CARBON-CLEAN', 'Carbon Cleaning', 'service', 'Mesin', 350000),
  ('SV-INJECTOR-CLEAN', 'Injector Cleaning', 'service', 'Mesin', 400000),
  ('SV-TIMING-BELT', 'Jasa Ganti Timing Belt', 'service', 'Mesin', 950000),
  ('SV-OVERHAUL-MINOR', 'Overhaul Mesin Minor', 'service', 'Mesin', 4500000),

  -- Sistem pendingin
  ('PR-RADIATOR', 'Radiator Assy', 'product', 'Pendingin', 1850000),
  ('PR-THERMOSTAT', 'Thermostat', 'product', 'Pendingin', 220000),
  ('PR-RADIATOR-HOSE', 'Selang Radiator', 'product', 'Pendingin', 180000),
  ('PR-RADIATOR-CAP', 'Tutup Radiator', 'product', 'Pendingin', 90000),
  ('PR-FAN-MOTOR', 'Motor Kipas Radiator', 'product', 'Pendingin', 780000),
  ('SV-KURAS-RADIATOR', 'Kuras Radiator', 'service', 'Pendingin', 200000),
  ('SV-SERVIS-RADIATOR', 'Servis Radiator', 'service', 'Pendingin', 450000),

  -- AC
  ('PR-FREON-R134A', 'Freon R134a', 'product', 'AC', 220000),
  ('PR-KOMPRESOR-AC', 'Kompresor AC', 'product', 'AC', 2750000),
  ('PR-KONDENSOR-AC', 'Kondensor AC', 'product', 'AC', 1650000),
  ('PR-EVAPORATOR-AC', 'Evaporator AC', 'product', 'AC', 1450000),
  ('PR-MAGNET-CLUTCH-AC', 'Magnet Clutch AC', 'product', 'AC', 850000),
  ('SV-VACUUM-ISI-FREON', 'Vacuum dan Isi Freon', 'service', 'AC', 350000),
  ('SV-CUCI-EVAPORATOR', 'Cuci Evaporator AC', 'service', 'AC', 450000),
  ('SV-SERVIS-KOMPRESOR-AC', 'Servis Kompresor AC', 'service', 'AC', 900000),

  -- Kelistrikan
  ('PR-AKI-45AH', 'Aki 45Ah', 'product', 'Kelistrikan', 950000),
  ('PR-AKI-65AH', 'Aki 65Ah', 'product', 'Kelistrikan', 1450000),
  ('PR-ALTERNATOR', 'Alternator', 'product', 'Kelistrikan', 1850000),
  ('PR-STARTER-MOTOR', 'Starter Motor', 'product', 'Kelistrikan', 1500000),
  ('PR-SEKERING-SET', 'Set Sekering', 'product', 'Kelistrikan', 90000),
  ('PR-LAMPU-LED-H4', 'Lampu Utama LED H4', 'product', 'Kelistrikan', 280000),
  ('PR-LAMPU-REM', 'Lampu Rem', 'product', 'Kelistrikan', 85000),
  ('SV-SERVIS-ALTERNATOR', 'Servis Alternator', 'service', 'Kelistrikan', 600000),
  ('SV-SERVIS-STARTER', 'Servis Starter Motor', 'service', 'Kelistrikan', 550000),
  ('SV-PASANG-AKSESORIS', 'Pemasangan Aksesoris Kelistrikan', 'service', 'Kelistrikan', 250000),

  -- Body & detailing
  ('SV-CAT-PANEL', 'Cat Ulang per Panel', 'service', 'Body Repair', 900000),
  ('SV-POLISH', 'Polish Body', 'service', 'Body Repair', 500000),
  ('SV-COATING', 'Nano Coating', 'service', 'Body Repair', 1800000),
  ('SV-KETOK-MINOR', 'Ketok Body Minor', 'service', 'Body Repair', 600000),
  ('SV-CUCI-MESIN', 'Cuci Mesin', 'service', 'Body Repair', 200000),
  ('SV-CUCI-DITAILING', 'Cuci Detailing Interior Eksterior', 'service', 'Body Repair', 450000)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  kind = EXCLUDED.kind,
  category = EXCLUDED.category,
  default_price = EXCLUDED.default_price,
  is_active = true,
  updated_at = now();
