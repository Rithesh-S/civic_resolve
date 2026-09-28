import 'package:equatable/equatable.dart';

enum NotificationType { newAssignment, requestApproved, requestRejected, slaWarning, unknown }

class Notification extends Equatable {
  final String id;
  final String title;
  final String message;
  final bool isRead;
  final DateTime createdAt;
  final NotificationType type;
  final String? relatedIssueId;

  const Notification({
    required this.id,
    required this.title,
    required this.message,
    required this.isRead,
    required this.createdAt,
    required this.type,
    this.relatedIssueId,
  });

  factory Notification.fromJson(Map<String, dynamic> json) {
    NotificationType typeFromString(String title) {
      if (title.toLowerCase().contains('approved')) return NotificationType.requestApproved;
      if (title.toLowerCase().contains('rejected')) return NotificationType.requestRejected;
      if (title.toLowerCase().contains('assigned')) return NotificationType.newAssignment;
      if (title.toLowerCase().contains('warning')) return NotificationType.slaWarning;
      return NotificationType.unknown;
    }

    // ✅ FIX: Safely parse the relatedIssueId
    String? parseRelatedIssueId(dynamic data) {
      if (data == null) {
        return null;
      }
      // Check if the data is a Map (object) and extract the '_id'
      if (data is Map<String, dynamic>) {
        return data['_id'] as String?;
      }
      // Fallback in case it's already a String
      if (data is String) {
        return data;
      }
      return null;
    }

    return Notification(
      id: json['_id'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      isRead: json['isRead'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      type: typeFromString(json['title']),
      // Use the new helper function to parse correctly
      relatedIssueId: parseRelatedIssueId(json['relatedIssueId']),
    );
  }

  Notification copyWith({bool? isRead}) {
    return Notification(
      id: id,
      title: title,
      message: message,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt,
      type: type,
      relatedIssueId: relatedIssueId, // Added for completeness
    );
  }

  @override
  // Updated for more accurate equality checks
  List<Object?> get props => [id, title, message, isRead, createdAt, type, relatedIssueId];
}