import 'dart:convert';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:municipal_officer_app/features/auth/bloc/auth_event.dart';
import 'package:municipal_officer_app/features/auth/bloc/auth_state.dart';
import 'package:municipal_officer_app/features/auth/models/user_model.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(AuthInitial()) {
    on<LoginButtonPressed>((event, emit) async {
      const storage = FlutterSecureStorage();
      try {
        final url = Uri.parse('http://10.223.140.88:5000/api/auth/login');
        final response = await http.post(
          url,
          headers: {'Content-Type': 'application/json'},
          body: json.encode({
            'phone': event.phone,
            'password': event.password,
            'location': event.location,
          }),
        );

        if (response.statusCode == 200) {
          final responseBody = json.decode(response.body);

          // 1. Create the full User object from the response
          final user = User.fromJson(responseBody['user']);

          // 2. Store only the essential ID for session checks
          await storage.write(key: 'userId', value: user.id);

          // 3. Emit success with the complete User object
          emit(AuthSuccess(user: user));
        }
      } catch (e) {
        print(e);
        emit(AuthFailure(
            error: 'Failed to connect to the server: ${e.toString()}'));
      }
    });

    // on<UpdateUserProfile>((event, emit) async {
    //   final currentState = state;
    //   if (currentState is AuthSuccess) {
    //     // Simulate an API call to save the data
    //     await Future.delayed(const Duration(milliseconds: 500));

    //     // Create a new user object with the updated details
    //     final updatedUser = currentState.user.copyWith(
    //       fullName: event.newFullName,
    //       email: event.newEmail,
    //       phone: event.newPhone,
    //     );

    //     // Emit a new success state with the updated user
    //     emit(AuthSuccess(user: updatedUser));
    //   }
    // });

    // Add handler for the logout event
    on<LogoutButtonPressed>((event, emit) async {
      // Here you would clear any saved tokens from SharedPreferences
      emit(AuthLoggedOut());
    });
  }
}
