import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('hospitals').select('*');
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Total hospitals:', data?.length);
        console.log('Cities:', Array.from(new Set(data?.map(h => h.city))));
    }
}
check();
