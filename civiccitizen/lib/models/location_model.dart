// lib/models/location_model.dart
class LocationModel {
  final double latitude;
  final double longitude;
  final String? address;

  LocationModel({
    required this.latitude,
    required this.longitude,
    this.address,
  });

  Map<String, dynamic> toJson() {
    return {
      'type': 'Point',
      'coordinates': [longitude, latitude],
      'address': address,
    };
  }

  static LocationModel fromJson(Map<String, dynamic> json) {
    return LocationModel(
      latitude: json['coordinates'][1],
      longitude: json['coordinates'][0],
      address: json['address'],
    );
  }
}