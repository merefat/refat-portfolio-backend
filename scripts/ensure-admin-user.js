require('dotenv').config();
const { supabaseAdmin } = require('../config/supabase');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'refat61899200@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'refat123';

async function ensureAdminUser() {
  try {
    console.log('Checking if admin user exists...');

    // Check if user already exists
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    const existingUser = users.find(user => user.email === ADMIN_EMAIL);

    if (existingUser) {
      console.log('✓ Admin user already exists:', ADMIN_EMAIL);
      
      // Check if email is confirmed
      if (!existingUser.email_confirmed_at) {
        console.log('  Email not confirmed, confirming now...');
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          { email_confirm: true }
        );
        
        if (confirmError) {
          console.error('  Error confirming email:', confirmError);
        } else {
          console.log('  ✓ Email confirmed successfully');
        }
      } else {
        console.log('  ✓ Email already confirmed');
      }
      
      return;
    }

    console.log('Admin user does not exist, creating...');

    // Create admin user with auto-confirm
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        role: 'admin'
      }
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return;
    }

    console.log('✓ Admin user created successfully');
    console.log('  Email:', ADMIN_EMAIL);
    console.log('  Password:', ADMIN_PASSWORD);
    console.log('  User ID:', data.user.id);
    console.log('\nYou can now login with these credentials.');

  } catch (error) {
    console.error('Error:', error);
  }
}

ensureAdminUser();
