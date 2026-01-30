-- Add quote column to daily_lessons table for daily leadership quotes
ALTER TABLE public.daily_lessons 
ADD COLUMN IF NOT EXISTS quote text;

-- Add some sample quotes for the first few days
UPDATE public.daily_lessons SET quote = 'The only way to do great work is to love what you do.' WHERE day_number = 1;
UPDATE public.daily_lessons SET quote = 'Leadership is not about being in charge. It is about taking care of those in your charge.' WHERE day_number = 2;
UPDATE public.daily_lessons SET quote = 'The greatest leader is not necessarily one who does the greatest things, but one who gets people to do the greatest things.' WHERE day_number = 3;
UPDATE public.daily_lessons SET quote = 'Before you are a leader, success is all about growing yourself. When you become a leader, success is all about growing others.' WHERE day_number = 4;
UPDATE public.daily_lessons SET quote = 'A leader takes people where they want to go. A great leader takes people where they don''t necessarily want to go, but ought to be.' WHERE day_number = 5;
