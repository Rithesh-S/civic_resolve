import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:municipal_officer_app/core/theme.dart';
import 'package:municipal_officer_app/features/auth/bloc/auth_bloc.dart';
import 'package:municipal_officer_app/features/auth/bloc/auth_event.dart';
import 'package:municipal_officer_app/features/auth/bloc/auth_state.dart';
import 'package:municipal_officer_app/features/issues/bloc/issues_bloc.dart';
import 'package:municipal_officer_app/features/issues/bloc/issues_event.dart';
import 'package:municipal_officer_app/features/notifications/bloc/notification_bloc.dart';
import 'package:municipal_officer_app/features/notifications/bloc/notification_event.dart';
import 'package:municipal_officer_app/features/shell/main_layout_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneFocusNode = FocusNode();
  final _passwordFocusNode = FocusNode();
  
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  
  bool _obscurePassword = true;
  bool _isFormValid = false;

  @override
  void initState() {
    super.initState();
    
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.2), end: Offset.zero).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    
    _animationController.forward();
    
    _phoneController.addListener(_validateForm);
    _passwordController.addListener(_validateForm);
    
    _phoneFocusNode.addListener(() => setState(() {}));
    _passwordFocusNode.addListener(() => setState(() {}));
  }
  
  void _validateForm() {
    final isValid = _phoneController.text.isNotEmpty && _passwordController.text.isNotEmpty;
    if (_isFormValid != isValid) {
      setState(() {
        _isFormValid = isValid;
      });
    }
  }
  
  @override
  void dispose() {
    _animationController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _phoneFocusNode.dispose();
    _passwordFocusNode.dispose();
    super.dispose();
  }
  
  void _submitForm() async {
    if (_formKey.currentState!.validate()) {
      FocusScope.of(context).unfocus();
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          // Handle case where user denies permission
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Location permissions are denied')),
          );
          return;
        }
      }

      // Fetch the current position
      final Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // 2. Format the location string as "longitude,latitude"
      final String locationString = '${position.longitude},${position.latitude}';
      
      // 3. Dispatch the event with phone, password, AND location
      context.read<AuthBloc>().add(
        LoginButtonPressed(
          phone: _phoneController.text,
          password: _passwordController.text,
          location: locationString, // Pass the location here!
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.error),
                backgroundColor: Colors.red,
                behavior: SnackBarBehavior.floating,
              ),
            );
          }
          if (state is AuthSuccess) {
            context.read<IssuesBloc>().add(FetchIssues());
            context.read<NotificationBloc>().add(FetchNotifications());
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => const MainLayoutPage()),
            );
          }
        },
        builder: (context, state) {
          return Stack(
            children: [
              // --- Background Gradient ---
              Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppTheme.primaryDark, AppTheme.accentBlue],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
              ),
              
              // --- Main Content ---
              SafeArea(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: FadeTransition(
                    opacity: _fadeAnimation,
                    child: SlideTransition(
                      position: _slideAnimation,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          SizedBox(height: MediaQuery.of(context).size.height * 0.1),
                          _buildHeader(),
                          const SizedBox(height: 48),
                          _buildForm(state),
                          const SizedBox(height: 24),
                          _buildForgotPasswordButton(),
                          SizedBox(height: MediaQuery.of(context).size.height * 0.1),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  // --- Helper Widgets for Cleaner Build Method ---

  Widget _buildHeader() {
    return Column(
      children: [
        Icon(Icons.security, color: Colors.white.withOpacity(0.8), size: 60),
        const SizedBox(height: 24),
        Text(
          "Officer Portal",
          style: GoogleFonts.inter(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: Colors.white,
            letterSpacing: -1,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          "Sign in to continue your work",
          style: GoogleFonts.inter(
            fontSize: 16,
            color: Colors.white.withOpacity(0.7),
          ),
        ),
      ],
    );
  }
  
  Widget _buildForm(AuthState state) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          // Email Input
          TextFormField(
            controller: _phoneController,
            focusNode: _phoneFocusNode,
            keyboardType: TextInputType.phone,
            textInputAction: TextInputAction.next,
            style: const TextStyle(color: Colors.white),
            decoration: _buildInputDecoration(
              labelText: "Mobile Number",
              icon: Icons.person_outline,
              hasFocus: _phoneFocusNode.hasFocus,
            ),
            validator: (value) => value!.isEmpty ? 'Please enter your Phone Number' : null,
          ),
          const SizedBox(height: 20),
          // Password Input
          TextFormField(
            controller: _passwordController,
            focusNode: _passwordFocusNode,
            obscureText: _obscurePassword,
            style: const TextStyle(color: Colors.white),
            decoration: _buildInputDecoration(
              labelText: "Password",
              icon: Icons.lock_outline,
              hasFocus: _passwordFocusNode.hasFocus,
            ).copyWith(
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                  color: Colors.white.withOpacity(0.7),
                ),
                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
            ),
            validator: (value) => value!.length < 6 ? 'Password is too short' : null,
          ),
          const SizedBox(height: 32),
          // Login Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: (state is AuthLoading || !_isFormValid) ? null : _submitForm,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: AppTheme.accentYellow,
                foregroundColor: AppTheme.primaryDark,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                disabledBackgroundColor: AppTheme.accentYellow.withOpacity(0.5),
              ),
              child: state is AuthLoading
                ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 3, color: AppTheme.primaryDark))
                : Text(
                    "SIGN IN",
                    style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1),
                  ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildForgotPasswordButton() {
    return TextButton(
      onPressed: () {},
      child: Text(
        "Forgot Password?",
        style: TextStyle(color: Colors.white.withOpacity(0.8)),
      ),
    );
  }

  InputDecoration _buildInputDecoration({required String labelText, required IconData icon, required bool hasFocus}) {
    return InputDecoration(
      labelText: labelText,
      labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
      prefixIcon: Icon(icon, color: hasFocus ? Colors.white : Colors.white.withOpacity(0.7)),
      filled: true,
      fillColor: Colors.white.withOpacity(0.1),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppTheme.accentYellow, width: 2),
      ),
    );
  }
}