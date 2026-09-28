import 'package:equatable/equatable.dart';
import 'package:latlong2/latlong.dart';

// NEW: Class for CitizenFeedback, matching the schema
class CitizenFeedback extends Equatable {
  final int? rating;
  final String? comment;

  const CitizenFeedback({this.rating, this.comment});

  factory CitizenFeedback.fromJson(Map<String, dynamic> json) {
    return CitizenFeedback(
      rating: json['rating'] as int?,
      comment: json['comment'] as String?,
    );
  }

  @override
  List<Object?> get props => [rating, comment];
}


// NEW: Nested class for the 'checks' object inside Verification
class VerificationChecks extends Equatable {
  // These are examples based on your schema. You might need to create
  // more detailed classes for exif, aiGenerated, etc., if needed.
  // For now, using Map<String, dynamic> for flexibility.
  final Map<String, dynamic>? exif;
  final Map<String, dynamic>? aiGenerated;
  final dynamic apiAnalysis; // Using dynamic for flexibility
  final dynamic relevance;     // Using dynamic for flexibility

  const VerificationChecks({
    this.exif,
    this.aiGenerated,
    this.apiAnalysis,
    this.relevance,
  });

  factory VerificationChecks.fromJson(Map<String, dynamic> json) {
    return VerificationChecks(
      exif: json['exif'] as Map<String, dynamic>?,
      aiGenerated: json['aiGenerated'] as Map<String, dynamic>?,
      apiAnalysis: json['apiAnalysis'],
      relevance: json['relevance'],
    );
  }

  @override
  List<Object?> get props => [exif, aiGenerated, apiAnalysis, relevance];
}

// UPDATED: The Verification class is completely rewritten to match the schema
class Verification extends Equatable {
  final double? confidenceScore;
  final VerificationChecks? checks;

  const Verification({
    this.confidenceScore,
    this.checks,
  });

  factory Verification.fromJson(Map<String, dynamic> json) {
    return Verification(
      confidenceScore: (json['confidenceScore'] as num?)?.toDouble(),
      checks: json['checks'] != null
          ? VerificationChecks.fromJson(json['checks'])
          : null,
    );
  }

  @override
  List<Object?> get props => [confidenceScore, checks];
}

// StatusHistory class remains mostly the same
class StatusHistory extends Equatable {
  final String status;
  final dynamic updatedBy;
  final DateTime timestamp;

  const StatusHistory({
    required this.status,
    required this.updatedBy,
    required this.timestamp,
  });

  factory StatusHistory.fromJson(Map<String, dynamic> json) {
    return StatusHistory(
      status: json['status'] as String,
      updatedBy: json['updatedBy'],
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }

  @override
  List<Object?> get props => [status, updatedBy, timestamp];
}

// Media class remains the same
class Media extends Equatable {
  final String url;
  final String type;
  final String role;

  const Media({required this.url, required this.type, required this.role});

  factory Media.fromJson(Map<String, dynamic> json) {
    return Media(
      url: json['url'] as String,
      type: json['type'] as String,
      role: json['role'] as String,
    );
  }

  @override
  List<Object?> get props => [url, type, role];
}

// Reporter class remains the same
class Reporter extends Equatable {
  final String id;
  final String fullName;
  final String? phone;

  const Reporter({required this.id, required this.fullName, this.phone});

  factory Reporter.fromJson(Map<String, dynamic> json) {
    return Reporter(
      id: json['_id'] as String,
      fullName: json['fullName'] as String,
      phone: json['phone'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, fullName, phone];
}

// UPDATED: IssueStatus enum with 'flagged' added
enum IssueStatus {
  submitted,
  verified,
  rejected,
  flagged, // NEW
  acknowledged,
  in_progress,
  resolved,
  closed
}

// IssuePriority enum remains the same
enum IssuePriority { critical, high, medium, low, very_low }


// HEAVILY UPDATED: The main Issue class with all fields matching the schema
class Issue extends Equatable {
  final String id;
  final Reporter reporter;
  final String ulbId;
  final String channel;
  final String title;
  final String? description;
  final String category;
  final IssueStatus status;
  final LatLng location;
  final String? wardId; // NEW: Added wardId (nullable)
  final IssuePriority priority;
  final String? assignedOfficerId; // NEW: Added assignedOfficerId (nullable)
  final List<Media> media;
  final Verification? verification; // UPDATED: Now nullable and uses the new structure
  final DateTime? slaDueDate; // UPDATED: Made nullable as per schema
  final List<StatusHistory> statusHistory;
  final CitizenFeedback? citizenFeedback; // NEW: Added CitizenFeedback (nullable)
  final int upvote;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Issue({
    required this.id,
    required this.reporter,
    required this.ulbId,
    required this.channel,
    required this.title,
    this.description,
    required this.category,
    required this.status,
    required this.location,
    this.wardId, // NEW
    required this.priority,
    this.assignedOfficerId, // NEW
    required this.media,
    this.verification, // UPDATED
    this.slaDueDate,   // UPDATED
    required this.statusHistory,
    this.citizenFeedback, // NEW
    required this.upvote,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Issue.fromJson(Map<String, dynamic> json) {
    // Helper functions
    IssueStatus statusFromString(String statusStr) {
      return IssueStatus.values.firstWhere(
            (e) => e.toString().split('.').last == statusStr,
        orElse: () => IssueStatus.submitted,
      );
    }

    IssuePriority priorityFromInt(int priorityInt) {
      switch (priorityInt) {
        case 1: return IssuePriority.critical;
        case 2: return IssuePriority.high;
        case 3: return IssuePriority.medium;
        case 4: return IssuePriority.low;
        default: return IssuePriority.very_low;
      }
    }

    final coords = json['location']['coordinates'] as List;
    final location = LatLng((coords[1] as num).toDouble(), (coords[0] as num).toDouble());

    return Issue(
      id: json['_id'] as String,
      reporter: Reporter.fromJson(json['reporterId']),
      ulbId: json['ulbId'] as String,
      channel: json['channel'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      category: json['category'] as String,
      status: statusFromString(json['status']),
      location: location,
      wardId: json['wardId'] as String?, // NEW: Parse wardId
      priority: priorityFromInt(json['priority'] ?? 5),
      assignedOfficerId: json['assignedOfficerId'] as String?, // NEW: Parse assignedOfficerId
      media: (json['media'] as List).map((m) => Media.fromJson(m)).toList(),
      verification: json['verification'] != null
          ? Verification.fromJson(json['verification'])
          : null, // UPDATED: Parse new Verification structure
      slaDueDate: json['slaDueDate'] != null
          ? DateTime.parse(json['slaDueDate'] as String)
          : null, // UPDATED: Handle nullable date
      statusHistory: (json['statusHistory'] as List)
          .map((h) => StatusHistory.fromJson(h))
          .toList(),
      citizenFeedback: json['citizenFeedback'] != null
          ? CitizenFeedback.fromJson(json['citizenFeedback'])
          : null, // NEW: Parse citizenFeedback
      upvote: json['upvote'] as int,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  // copyWith can be expanded if needed
  Issue copyWith({
    IssueStatus? status,
    DateTime? slaDueDate,
  }) {
    return Issue(
      id: id,
      reporter: reporter,
      ulbId: ulbId,
      channel: channel,
      title: title,
      description: description,
      category: category,
      status: status ?? this.status,
      location: location,
      wardId: wardId,
      priority: priority,
      assignedOfficerId: assignedOfficerId,
      media: media,
      verification: verification,
      slaDueDate: slaDueDate ?? this.slaDueDate,
      statusHistory: statusHistory,
      citizenFeedback: citizenFeedback,
      upvote: upvote,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  @override
  List<Object?> get props => [
    id,
    reporter,
    ulbId,
    channel,
    title,
    status,
    wardId, // NEW
    priority,
    assignedOfficerId, // NEW
    media,
    verification,
    slaDueDate,
    statusHistory,
    citizenFeedback, // NEW
    upvote,
    createdAt,
    updatedAt,
  ];
}