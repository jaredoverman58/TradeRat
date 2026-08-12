-- Migration 016: Hide Stats and Testimonials sections
-- These sections should be hidden until real data is available

UPDATE landing_page_sections
SET is_active = false
WHERE section_key IN ('stats', 'testimonials');
