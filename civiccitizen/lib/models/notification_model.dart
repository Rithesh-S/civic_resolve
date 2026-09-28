// lib/models/notification_model.dart

class AppNotification {
  final String id;
  final String title;
  final String message;
  bool isRead;
  final DateTime createdAt;
  final RelatedIssue? relatedIssue; // For populated issue data

  AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.isRead,
    required this.createdAt,
    this.relatedIssue,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['_id'],
      title: json['title'],
      message: json['message'],
      isRead: json['isRead'],
      createdAt: DateTime.parse(json['createdAt']),
      // Check if relatedIssueId is populated and is an object
      relatedIssue: json['relatedIssueId'] != null && json['relatedIssueId'] is Map
          ? RelatedIssue.fromJson(json['relatedIssueId'])
          : null,
    );
  }
}

class RelatedIssue {
  final String id;
  final String title;

  RelatedIssue({required this.id, required this.title});

  factory RelatedIssue.fromJson(Map<String, dynamic> json) {
    return RelatedIssue(
      id: json['_id'],
      title: json['title'],
    );
  }
}