import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_apju_2024';

const adminController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find admin by email
      const admin = await Admin.findByEmail(email);
      
      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isMatch = await Admin.verifyPassword(password, admin.password);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: admin._id, email: admin.email }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  },

  getProfile: async (req, res) => {
    try {
      const admin = await Admin.findById(req.admin.id).select('-password');
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      
      res.json({
        success: true,
        data: admin
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update admin profile
  updateProfile: async (req, res) => {
    try {
      const { name, email } = req.body;
      const adminId = req.admin.id;

      const updateData = {};
      if (name) updateData.name = name.trim();
      if (email) {
        // Check if email is already taken by another admin
        const existingAdmin = await Admin.findOne({ 
          email: email.toLowerCase(), 
          _id: { $ne: adminId } 
        });
        
        if (existingAdmin) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        
        updateData.email = email.toLowerCase().trim();
      }

      const updatedAdmin = await Admin.findByIdAndUpdate(
        adminId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        success: true,
        data: updatedAdmin,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const adminId = req.admin.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          message: 'Current password and new password are required' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          message: 'New password must be at least 6 characters long' 
        });
      }

      const admin = await Admin.findById(adminId);
      
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      // Verify current password
      const isMatch = await admin.comparePassword(currentPassword);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Update password
      admin.password = newPassword;
      await admin.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password' });
    }
  }
};

export default adminController;