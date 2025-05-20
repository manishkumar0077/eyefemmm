
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const CALENDARIFIC_API_KEY = Deno.env.get('CALENDARIFIC_API_KEY') || 'lffF19SFawfhmvusxyrvUNWoHTC3zAgH';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { year } = await req.json();
    const currentYear = year || new Date().getFullYear();
    
    console.log(`Fetching Indian holidays for ${currentYear}`);
    
    // Fetch holidays from Calendarific API
    const calendarificUrl = `https://calendarific.com/api/v2/holidays?api_key=${CALENDARIFIC_API_KEY}&country=IN&year=${currentYear}`;
    
    const response = await fetch(calendarificUrl);
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.response || !data.response.holidays || !Array.isArray(data.response.holidays)) {
      throw new Error('Invalid response format from Calendarific API');
    }
    
    const holidays = data.response.holidays;
    
    // Filter out non-Indian holidays
    const nonIndianHolidays = [
      'Hanukkah', 'Valentine\'s Day', 'Lunar New Year', 'March Equinox',
      'June Solstice', 'September Equinox', 'December Solstice'
    ];
    
    const indianHolidays = holidays.filter(holiday => {
      return !nonIndianHolidays.some(name => 
        holiday.name.toLowerCase().includes(name.toLowerCase())
      );
    });
    
    console.log(`Received ${indianHolidays.length} Indian holidays from Calendarific API`);
    
    // Connect to Supabase with service role key for admin privileges
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Make sure the holidays table exists and has a description column
    try {
      await supabase.rpc('create_holidays_table');
    } catch (error) {
      console.log("Function might already exist or there was an error:", error);
    }
    
    // Ensure we don't duplicate holidays
    const { data: existingHolidays } = await supabase
      .from('holidays')
      .select('date, name')
      .eq('type', 'national');
    
    // Store holidays in database - Changed 'api' to 'national' to match allowed types
    const holidaysToInsert = indianHolidays
      .filter(holiday => {
        const holidayDate = holiday.date.iso.substring(0, 10);
        // Check if holiday already exists to prevent duplicates
        return !existingHolidays?.some(existing => 
          existing.date === holidayDate && 
          existing.name === holiday.name
        );
      })
      .map(holiday => ({
        date: holiday.date.iso.substring(0, 10), // Format: YYYY-MM-DD
        name: holiday.name,
        description: holiday.description || null,
        type: 'national', // Changed from 'api' to 'national' which is an allowed type
        doctor: null // Applies to all doctors
      }));
    
    if (holidaysToInsert.length === 0) {
      console.log('No new holidays to insert');
      return new Response(
        JSON.stringify({
          success: true,
          count: 0,
          message: `No new Indian holidays to import for ${currentYear}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    // Insert the fetched holidays
    const { error } = await supabase
      .from('holidays')
      .insert(holidaysToInsert);
      
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        count: holidaysToInsert.length,
        message: `Successfully imported ${holidaysToInsert.length} Indian holidays for ${currentYear}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
