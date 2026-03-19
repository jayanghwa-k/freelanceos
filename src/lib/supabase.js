import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://shtletzbzqlqdhsbbupb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNodGxldHpienFscWRoc2JidXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzIwMzUsImV4cCI6MjA4OTQ0ODAzNX0.p_jGaKAdcDrxpzhnYs8O1zxkJdyIKzY44IP15UFBKv0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)