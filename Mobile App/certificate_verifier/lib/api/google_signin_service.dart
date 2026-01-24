
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class GoogleSignInService {
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    clientId: dotenv.env['GOOGLE_CLIENT_ID'],
    scopes: ['email', 'profile'],
  );

  Future<Map<String, dynamic>?> signIn() async {
    try {
      
      final GoogleSignInAccount? account = await _googleSignIn.signIn();
      if (account == null) return null; 

      
      final GoogleSignInAuthentication auth = await account.authentication;

      
      final Map<String, dynamic> userInfo = {
        'googleId': account.id,
        'email': account.email,
        'name': account.displayName,
        'photoUrl': account.photoUrl,
        'accessToken': auth.accessToken,
      };

      
      final response = await http.post(
        Uri.parse("https://yourapi.com/api/auth/google-login"),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(userInfo),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        print("Backend error: ${response.body}");
        return null;
      }
    } catch (e) {
      print("Google Sign-In failed: $e");
      return null;
    }
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
  }
}