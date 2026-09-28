import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:municipal_officer_app/core/theme.dart';
import 'package:municipal_officer_app/features/auth/bloc/auth_bloc.dart';
import 'package:municipal_officer_app/features/auth/bloc/auth_event.dart';
import 'package:municipal_officer_app/features/auth/bloc/auth_state.dart';
import 'package:municipal_officer_app/features/auth/models/user_model.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  bool _isEditMode = false;
  
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;

  @override
  void initState() {
    super.initState();
    final user = (context.read<AuthBloc>().state as AuthSuccess).user;
    _nameController = TextEditingController(text: user.fullName);
    _emailController = TextEditingController(text: user.email);
    _phoneController = TextEditingController(text: user.phone);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthBloc>().state;
    
    // If the state is not success, show a loading or error screen
    if (authState is! AuthSuccess) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    // We now have the full user object
    final user = authState.user;

    return Scaffold(
      extendBodyBehindAppBar: true, // Allows body to go behind app bar
      appBar: AppBar(
        title: const Text("My Profile", style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.transparent, // Make app bar transparent
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            iconSize: 40,
            icon: Icon(_isEditMode ? CupertinoIcons.xmark_circle_fill : CupertinoIcons.pencil_circle_fill),
            onPressed: () {
              setState(() {
                // If cancelling edit, reset controller values
                if (_isEditMode) {
                  _nameController.text = user.fullName;
                  _emailController.text = user.email;
                  _phoneController.text = user.phone;
                }
                _isEditMode = !_isEditMode;
              });
            },
          )
        ],
      ),
      body: Stack(
        children: [
          // --- Background Header ---
          _buildHeaderBackground(),

          // --- Scrollable Content ---
          SingleChildScrollView(
            child: Column(
              children: [
                SizedBox(height: AppBar().preferredSize.height),
                _buildProfileHeader(user),
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  // Animated switcher for smooth transition between view and edit modes
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    transitionBuilder: (child, animation) {
                      return FadeTransition(opacity: animation, child: child);
                    },
                    child: _isEditMode 
                      ? _buildProfileEditForm(user) 
                      : _buildProfileView(user),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // --- UI Helper Widgets ---

  Widget _buildHeaderBackground() {
    return Container(
      height: 250,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.accentBlue, AppTheme.primaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
      ),
    );
  }

  Widget _buildProfileHeader(User user) {
    return Column(
      children: [
        CircleAvatar(
          radius: 55,
          backgroundColor: Colors.white,
          child: CircleAvatar(
            radius: 50,
            backgroundColor: AppTheme.accentBlue.withOpacity(0.1),
            child: Text(
              user.fullName.isNotEmpty ? user.fullName[0] : 'U',
              style: const TextStyle(fontSize: 40, color: AppTheme.accentBlue, fontWeight: FontWeight.bold),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          user.fullName, 
          style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)
        ),
        Text(
          user.role, 
          style: GoogleFonts.inter(fontSize: 16, color: Colors.white.withOpacity(0.8))
        ),
      ],
    );
  }
  
  Widget _buildProfileView(User user) {
    return Column(
      key: const ValueKey('profile_view'),
      children: [
        _buildSectionCard(
          title: "Officer Details",
          children: [
            _buildInfoTile(icon: CupertinoIcons.barcode, title: "Officer Code", value: user.officerCode),
            _buildInfoTile(icon: CupertinoIcons.building_2_fill, title: "Department", value: user.department),
            _buildInfoTile(icon: CupertinoIcons.phone, title: "Phone", value: user.phone),
            _buildInfoTile(icon: CupertinoIcons.placemark, title: "Assigned Ward", value: user.wardName),
          ],
        ),
        const SizedBox(height: 16),
        _buildSectionCard(
          title: "Actions",
          children: [
            ListTile(
              leading: const Icon(CupertinoIcons.question_circle, color: AppTheme.textSubtle),
              title: const Text("Help & Support"),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
            ),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text("Log Out", style: TextStyle(color: Colors.red)),
              onTap: () => context.read<AuthBloc>().add(LogoutButtonPressed()),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildProfileEditForm(User user) {
    return Column(
      key: const ValueKey('profile_edit_form'),
      children: [
        _buildSectionCard(
          title: "Edit Information",
          children: [
            const SizedBox(height: 16),
            TextFormField(controller: _nameController, decoration: _buildInputDecoration(labelText: "Full Name")),
            const SizedBox(height: 24),
            TextFormField(controller: _emailController, decoration: _buildInputDecoration(labelText: "Email Address")),
            const SizedBox(height: 24),
            TextFormField(controller: _phoneController, decoration: _buildInputDecoration(labelText: "Phone Number")),
            const SizedBox(height: 16),
          ],
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: () {
            context.read<AuthBloc>().add(UpdateUserProfile(
              newFullName: _nameController.text,
              newEmail: _emailController.text,
              newPhone: _phoneController.text,
            ));
            setState(() { _isEditMode = false; });
          },
          style: ElevatedButton.styleFrom(
            minimumSize: const Size(double.infinity, 50),
            backgroundColor: AppTheme.accentYellow,
            foregroundColor: AppTheme.primaryDark,
          ),
          child: Text("Save Changes", style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 16)),
        ),
      ],
    );
  }
  
  // --- Reusable Helper Widgets ---

  Widget _buildSectionCard({required String title, required List<Widget> children}) {
    return Card(
      elevation: 2,
      shadowColor: Colors.black.withOpacity(0.05),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.primaryDark)),
            const Divider(height: 24),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTile({required IconData icon, required String title, required String value}) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon, color: AppTheme.textSubtle),
      title: Text(title),
      trailing: Text(value, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryDark)),
    );
  }

  InputDecoration _buildInputDecoration({required String labelText}) {
    return InputDecoration(
      labelText: labelText,
      filled: true,
      fillColor: Colors.grey.shade50,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppTheme.accentBlue, width: 1.5),
      ),
    );
  }
}