import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Créer l'utilisateur admin avec email confirmé
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@demo.com',
      password: 'AdminDemo2024!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'Demo',
        role: 'admin'
      }
    });

    if (authError) {
      throw authError;
    }

    if (!authUser.user) {
      throw new Error('User creation failed');
    }

    // Insérer dans public.users
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        user_id: authUser.user.id,
        email: 'admin@demo.com',
        first_name: 'Admin',
        last_name: 'Demo',
        role: 'admin'
      });

    if (userError) {
      console.error('Error creating user record:', userError);
    }

    // Attribuer le rôle admin
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: authUser.user.id,
        role: 'admin'
      });

    if (roleError) {
      console.error('Error assigning admin role:', roleError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Compte admin créé avec succès. Email: admin@demo.com, Password: AdminDemo2024!' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
