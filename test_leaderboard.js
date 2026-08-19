const { createClient } = require('./node_modules/@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseClientCode = fs.readFileSync('supabaseClient.ts', 'utf8');
const urlMatch = supabaseClientCode.match(/const supabaseUrl = '([^']+)'/);
const keyMatch = supabaseClientCode.match(/const supabaseAnonKey = '([^']+)'/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  
  async function test() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('xp', { ascending: false })
      .limit(50);
      
    console.log("Error:", error);
    console.log("Data count:", data ? data.length : 0);
    console.log("Data:", JSON.stringify(data, null, 2));
  }
  
  test();
} else {
  console.log("Could not find credentials");
}
