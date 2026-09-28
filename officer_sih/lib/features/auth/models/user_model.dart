import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String fullName;
  final String email;
  final String phone; // <-- ADD THIS
  final String role;
  final String department;
  final String officerCode;
  final String wardName;
  final Location? location;

  const User(
      {required this.id,
      required this.fullName,
      required this.email,
      required this.phone, // <-- ADD THIS
      required this.role,
      required this.department,
      required this.officerCode,
      required this.wardName,
      this.location});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      fullName: json['fullName'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String,
      role: json['role'] as String,
      // Provide default values for fields that might be missing in some responses
      department: json['department'] as String? ?? 'N/A',
      officerCode: json['officerCode'] as String? ?? 'N/A',
      wardName: json['wardName'] as String? ?? 'Ward 1',
      // Safely parse the nested location object
      location: json['location'] != null
          ? Location.fromJson(json['location'])
          : null,
    );
  }

  @override
  List<Object?> get props => [
        id,
        fullName,
        email,
        phone,
        role,
        department,
        officerCode,
        wardName,
        location,
      ];
}

class Location {
  final String type;
  final List<double> coordinates;

  Location({
    required this.type,
    required this.coordinates,
  });

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      type: json['type'] as String,
      coordinates: List<double>.from(
        (json['coordinates'] as List).map((coord) => (coord as num).toDouble()),
      ),
    );
  }
}
