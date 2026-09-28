// lib/features/auth/bloc/auth_state.dart
import 'package:equatable/equatable.dart';
import 'package:municipal_officer_app/features/auth/models/user_model.dart';

abstract class AuthState extends Equatable {
  const AuthState();
  @override
  List<Object> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

// Modified to hold user data
class AuthSuccess extends AuthState {
  final User user; // Hold the complete User object

  const AuthSuccess({required this.user});

  @override
  List<Object> get props => [user];
}

class AuthFailure extends AuthState {
  final String error;
  const AuthFailure({required this.error});
  @override
  List<Object> get props => [error];
}

// New state for after logout
class AuthLoggedOut extends AuthState {}