// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://flxydemwwfcqkkonpjye.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseHlkZW13d2ZjcWtrb25wanllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDc2OTUsImV4cCI6MjA2NzMyMzY5NX0.vmNmNEod8PaUJS_Fd-16aamGclH8s1jSf-4uyPpTs0A';
export const supabase = createClient(supabaseUrl, supabaseKey);