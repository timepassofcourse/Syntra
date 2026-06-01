import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxnfjjonbdkgfqxqqczm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bmZqam9uYmRrZ2ZxeHFxY3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTQyMzIsImV4cCI6MjA5NTc3MDIzMn0.kNyp10pijHycS-2nmzusNPW3VlSI5xETHksQIPIJofE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  const tables = ['profiles', 'assignments', 'attendance', 'notes'];
  
  for (const table of tables) {
    try {
      const { data, error, status, statusText } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      console.log(`Table '${table}': Status ${status} (${statusText})`);
      if (error) {
        console.log(`  Error:`, error.message, error.details, error.hint);
      } else {
        console.log(`  Success! Data fetched:`, data);
      }
    } catch (e) {
      console.error(`  Exception:`, e);
    }
  }
}

checkTables();
