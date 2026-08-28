const { createClient } = require('./node_modules/@supabase/supabase-js');

const url = 'https://sydkkzowpuoxrobusomc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5ZGtrem93cHVveHJvYnVzb21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxNzQ3NTcsImV4cCI6MjEwMTc1MDc1N30.5JhlrouVQ_4omR2x1kItH8pAIllWQOzlu46Ae3HxTfQ';

const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('profiles').select('count').limit(1);
  console.log('Profiles table check -> Error:', error, 'Data:', data);
}
test();
