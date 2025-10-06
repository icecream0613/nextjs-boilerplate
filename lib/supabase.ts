// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_API_KEY!;

console.log('supabaseUrl', supabaseUrl);
console.log('supabaseKey', supabaseKey);

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;