import 'package:flutter/material.dart';

class AppColors {
  // Primary trustworthy blue palette
  static const Color primaryBlue = Color(0xFF1E40AF); // Deep trust blue
  static const Color primaryLight = Color(0xFF3B82F6); // Bright blue
  static const Color primaryDark = Color(0xFF1E3A8A); // Dark navy blue
  
  // Accent colors
  static const Color accentCyan = Color(0xFF06B6D4); // Verification accent
  static const Color accentTeal = Color(0xFF14B8A6); // Success accent
  
  // Status colors
  static const Color success = Color(0xFF10B981); // Verified green
  static const Color warning = Color(0xFFF59E0B); // Warning orange
  static const Color error = Color(0xFFEF4444); // Error red
  static const Color pending = Color(0xFF6366F1); // Pending purple
  
  // Neutral colors
  static const Color white = Color(0xFFFFFFFF);
  static const Color lightGray = Color(0xFFF3F4F6);
  static const Color mediumGray = Color(0xFF9CA3AF);
  static const Color darkGray = Color(0xFF374151);
  static const Color black = Color(0xFF111827);
  
  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryBlue, primaryLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient accentGradient = LinearGradient(
    colors: [accentCyan, accentTeal],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  // Theme-aware colors
  static Color getBackground(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? const Color(0xFF0F172A)
        : white;
  }
  
  static Color getCardBackground(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? const Color(0xFF1E293B)
        : white;
  }
  
  static Color getText(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? white
        : black;
  }
  
  static Color getLightText(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? const Color(0xFF94A3B8)
        : mediumGray;
  }
  
  static Color getShadow(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? Colors.black.withOpacity(0.3)
        : Colors.black.withOpacity(0.1);
  }
}
