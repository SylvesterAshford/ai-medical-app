import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const mockHospitals = [
    { name: 'Mandalay General Hospital (မန္တလေး အထွေထွေရောဂါကုဆေးရုံကြီး)', city: 'Mandalay', latitude: 21.9750, longitude: 96.0836, phone: '02-123456', type: 'public', emergency_24hr: true },
    { name: 'City Hospital Mandalay (စီးတီး ဆေးရုံ မန္တလေး)', city: 'Mandalay', latitude: 21.9800, longitude: 96.0900, phone: '02-765432', type: 'private', emergency_24hr: true },
    { name: 'Yangon General Hospital (ရန်ကုန် အထွေထွေရောဂါကုဆေးရုံကြီး)', city: 'Yangon', latitude: 16.7808, longitude: 96.1497, phone: '01-256112', type: 'public', emergency_24hr: true }
];

async function seed() {
    const { data, error } = await supabase.from('hospitals').insert(mockHospitals).select();
    if (error) {
        console.error('Insert error:', error.message);
    } else {
        console.log('Successfully seeded:', data);
    }
}

seed();
