import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();
  @override
  List<Object?> get props => [];
}

class LoginButtonPressed extends AuthEvent {
  final String phone;
  final String password;
  final String? location; // Add nullable location field

  const LoginButtonPressed({
    required this.phone,
    required this.password,
    this.location,
  });

  @override
  List<Object?> get props => [phone, password, location];
}

class UpdateUserProfile extends AuthEvent {
  final String newFullName;
  final String newEmail;
  final String newPhone;

  const UpdateUserProfile({required this.newFullName, required this.newEmail, required this.newPhone});
}

class LogoutButtonPressed extends AuthEvent {}