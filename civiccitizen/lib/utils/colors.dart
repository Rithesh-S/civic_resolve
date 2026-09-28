// lib/utils/colors.dart
import 'package:flutter/material.dart';

/// A class to hold the application's color palette for consistent UI.
class AppColors {
  static const Color primary = Color(0xFF2563EB);
  static const Color secondary = Color(0xFF06B6D4);
  static const Color accent = Color(0xFFFACC15);
  
  static const Color backgroundDark = Color(0xFF0F172A);
  static const Color backgroundLight = Color(0xFFF9FAFB);

  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);

  static const Gradient primaryGradient = LinearGradient(
    colors: [primary, secondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
