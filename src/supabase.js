import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://muzzjvegynsemlsbwggf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11enpqdmVneW5zZW1sc2J3Z2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MTI0NTQsImV4cCI6MjA1MTM4ODQ1NH0.3ilk8J4sDq4tXl8KPRK_MqTIuWcYnhO0Tbb1p-Tw0gc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
