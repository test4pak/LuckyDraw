-- Sample data for testing (optional - remove in production)

-- Sample Events
INSERT INTO public.events (id, title, description, status, start_date, end_date)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Eid Special Lucky Draw 2024',
    'Join our special Eid celebration lucky draw and win amazing prizes including smartphones, cash prizes, and shopping vouchers! Don''t miss this opportunity to celebrate Eid with exciting rewards.',
    'running',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '10 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Summer Mega Draw',
    'Beat the heat with our summer mega draw! Win cool gadgets, air conditioners, and summer vacation packages. Perfect prizes for the hot summer season!',
    'running',
    CURRENT_DATE - INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '20 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Tech Gadgets Bonanza',
    'Win the latest tech gadgets including smartphones, laptops, smartwatches, and more. Tech enthusiasts, this is your chance!',
    'running',
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '15 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'Independence Day Special',
    'Celebrate Pakistan''s Independence Day with our special lucky draw. Win amazing prizes and show your patriotic spirit!',
    'upcoming',
    CURRENT_DATE + INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '25 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440005',
    'Ramadan Blessings Draw',
    'Join us during the holy month of Ramadan for a special blessing draw. Win cash prizes, home appliances, and more!',
    'upcoming',
    CURRENT_DATE + INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '40 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440006',
    'Back to School Draw',
    'Help your kids start the new school year right! Win school supplies, laptops, tablets, and educational prizes.',
    'upcoming',
    CURRENT_DATE + INTERVAL '20 days',
    CURRENT_DATE + INTERVAL '50 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440007',
    'New Year Celebration Draw',
    'Start the new year with a bang! Participate in our New Year celebration draw and win exciting prizes.',
    'completed',
    CURRENT_DATE - INTERVAL '60 days',
    CURRENT_DATE - INTERVAL '30 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440008',
    'Winter Wonderland Draw',
    'Stay warm this winter with our special draw. Win heaters, blankets, winter clothing, and cozy home items.',
    'completed',
    CURRENT_DATE - INTERVAL '90 days',
    CURRENT_DATE - INTERVAL '60 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440009',
    'Valentine''s Day Special',
    'Spread love this Valentine''s Day! Win romantic dinner vouchers, jewelry, and couple packages.',
    'completed',
    CURRENT_DATE - INTERVAL '120 days',
    CURRENT_DATE - INTERVAL '90 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Sample Prizes for Event 1 (Eid Special)
INSERT INTO public.prizes (event_id, name, description, category, image_url)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'iPhone 15 Pro Max',
    'Latest iPhone with 256GB storage, Titanium design, and Pro camera system.',
    'Electronics',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'PKR 50,000 Cash Prize',
    'Win PKR 50,000 in cash! Transfer directly to your bank account.',
    'Cash',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Shopping Voucher - PKR 25,000',
    'Shopping voucher worth PKR 25,000 redeemable at major retail stores.',
    'Vouchers',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Samsung Galaxy S24 Ultra',
    'Premium Android smartphone with S Pen, 200MP camera, and 512GB storage.',
    'Electronics',
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Gold Jewelry Set',
    'Beautiful traditional gold jewelry set perfect for Eid celebrations.',
    'Jewelry',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'PKR 10,000 Cash Prize',
    'Additional cash prize of PKR 10,000 for lucky winners.',
    'Cash',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop'
  )
ON CONFLICT DO NOTHING;

-- Sample Prizes for Event 2 (Summer Mega Draw)
INSERT INTO public.prizes (event_id, name, description, category, image_url)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Split AC - 1.5 Ton',
    'Energy-efficient split air conditioner perfect for summer.',
    'Electronics',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Summer Vacation Package',
    'All-inclusive vacation package for 2 to Northern Areas of Pakistan.',
    'Travel',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Refrigerator - 20 Cubic Feet',
    'Large capacity refrigerator to keep your food fresh all summer.',
    'Electronics',
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'PKR 30,000 Cash Prize',
    'Win PKR 30,000 in cash to enjoy your summer!',
    'Cash',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Cooling Fan Tower',
    'Modern tower fan with remote control and multiple speed settings.',
    'Electronics',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop'
  )
ON CONFLICT DO NOTHING;

-- Sample Prizes for Event 3 (Tech Gadgets Bonanza)
INSERT INTO public.prizes (event_id, name, description, category, image_url)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'MacBook Pro M3',
    'Latest MacBook Pro with M3 chip, 16GB RAM, and 512GB SSD.',
    'Electronics',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'iPad Pro 12.9 inch',
    'Powerful iPad Pro with M2 chip, perfect for work and creativity.',
    'Electronics',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Apple Watch Series 9',
    'Latest Apple Watch with advanced health and fitness features.',
    'Electronics',
    'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'AirPods Pro 2',
    'Premium wireless earbuds with active noise cancellation.',
    'Electronics',
    'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Sony WH-1000XM5 Headphones',
    'Industry-leading noise-canceling headphones with premium sound.',
    'Electronics',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop'
  )
ON CONFLICT DO NOTHING;

-- Sample Prizes for Event 4 (Independence Day Special)
INSERT INTO public.prizes (event_id, name, description, category, image_url)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'PKR 75,000 Cash Prize',
    'Win PKR 75,000 in cash to celebrate Independence Day!',
    'Cash',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'Pakistan Flag Collection',
    'Premium Pakistan flag and patriotic merchandise collection.',
    'Merchandise',
    'https://images.unsplash.com/photo-1594736797933-d0cbc0b0e0c1?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'Shopping Voucher - PKR 30,000',
    'Shopping voucher for all your Independence Day shopping needs.',
    'Vouchers',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop'
  )
ON CONFLICT DO NOTHING;

-- Sample Prizes for Event 5 (Ramadan Blessings)
INSERT INTO public.prizes (event_id, name, description, category, image_url)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440005',
    'PKR 100,000 Cash Prize',
    'Grand cash prize of PKR 100,000 for Ramadan blessings.',
    'Cash',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440005',
    'Home Appliance Package',
    'Complete home appliance package including microwave, blender, and more.',
    'Electronics',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440005',
    'Grocery Voucher - PKR 20,000',
    'Grocery shopping voucher for your Ramadan needs.',
    'Vouchers',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop'
  )
ON CONFLICT DO NOTHING;

-- Sample Prizes for Event 6 (Back to School)
INSERT INTO public.prizes (event_id, name, description, category, image_url)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440006',
    'Laptop - HP Pavilion',
    'Perfect laptop for students with all necessary features.',
    'Electronics',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440006',
    'iPad Air',
    'Lightweight and powerful iPad for educational purposes.',
    'Electronics',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440006',
    'School Supplies Package',
    'Complete school supplies package including bags, books, and stationery.',
    'Education',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop'
  )
ON CONFLICT DO NOTHING;

