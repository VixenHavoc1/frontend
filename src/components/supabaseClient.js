// supabaseClient.js

import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project URL and anon key
const NEXT_PUBLIC_SUPABASE_URL = 'https://rehcxrsbpawciqsfgiop.supabase.co'
const NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlaGN4cnNicGF3Y2lxc2ZnaW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczOTY5ODcsImV4cCI6MjA2Mjk3Mjk4N30.1nWEbTbF45Z8NJibMouVpLh4s55UCZMzh82wa5eBEy0'

export const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY )
