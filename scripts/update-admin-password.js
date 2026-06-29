require('dotenv').config();
const { supabaseAdmin } = require('../config/supabase');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'refat61899200@gmail.com';
const NEW_PASSWORD = 'refat123';

async function updateAdminPassword() {
  try {
    console.log('Finding admin user...');

    // List users to find the admin
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    const user = users.find(u => u.email === ADMIN_EMAIL);

    if (!user) {
      console.error('Admin user not found:', ADMIN_EMAIL);
      return;
    }

    console.log('✓ Found admin user:', ADMIN_EMAIL);
    console.log('  User ID:', user.id);

    // Update password
    console.log('Updating password...');
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: NEW_PASSWORD }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return;
    }

    console.log('✓ Password updated successfully');
    console.log('  New password:', NEW_PASSWORD);
    console.log('\nYou can now login with:');
    console.log('  Email:', ADMIN_EMAIL);
    console.log('  Password:', NEW_PASSWORD);

  } catch (error) {
    console.error('Error:', error);
  }
}

updateAdminPassword();
