enum IssueStatus {
  submitted,
  acknowledged,
  inProgress,
  resolved,
  closed,
  rejected,
}

enum IssueCategory { roads, sanitation, streetlight, parks, waterleakage }

class Issue {
  final String id;
  final String title;
  final String description;
  final IssueCategory category;
  final IssueStatus status;
  final int priority;
  final String
  locationAddress; // You don’t have a plain address, so keep empty for now
  final List<double> coordinates; // from location.coordinates
  final String? assignedOfficerId;
  final String? assignedOfficerName;
  final String reporterId;
  final String channel;
  final DateTime createdAt;
  final DateTime slaDueDate;
  final int upvoteCount;
  final List<IssueMedia> media;
  final List<IssueStatusHistory> statusHistory;

  Issue({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.status,
    required this.priority,
    required this.locationAddress,
    required this.coordinates,
    this.assignedOfficerId,
    this.assignedOfficerName,
    required this.reporterId,
    required this.channel,
    required this.createdAt,
    required this.slaDueDate,
    required this.upvoteCount,
    required this.media,
    required this.statusHistory,
  });
  Issue copyWith({
    String? id,
    String? title,
    String? description,
    IssueCategory? category,
    IssueStatus? status,
    int? priority,
    String? locationAddress,
    List<double>? coordinates,
    String? assignedOfficerId,
    String? assignedOfficerName,
    String? reporterId,
    String? channel,
    DateTime? createdAt,
    DateTime? slaDueDate,
    int? upvoteCount,
    List<IssueMedia>? media,
    List<IssueStatusHistory>? statusHistory,
  }) {
    return Issue(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      locationAddress: locationAddress ?? this.locationAddress,
      coordinates: coordinates ?? this.coordinates,
      assignedOfficerId: assignedOfficerId ?? this.assignedOfficerId,
      assignedOfficerName: assignedOfficerName ?? this.assignedOfficerName,
      reporterId: reporterId ?? this.reporterId,
      channel: channel ?? this.channel,
      createdAt: createdAt ?? this.createdAt,
      slaDueDate: slaDueDate ?? this.slaDueDate,
      upvoteCount: upvoteCount ?? this.upvoteCount,
      media: media ?? this.media,
      statusHistory: statusHistory ?? this.statusHistory,
    );
  }

  factory Issue.fromJson(Map<String, dynamic> json) {
    // Safely parse coordinates
    List<double> coordinates = [];
    try {
      if (json['location'] is Map<String, dynamic> &&
          json['location']['coordinates'] is List<dynamic>) {
        coordinates = (json['location']['coordinates'] as List).map((coord) {
          if (coord is int) return coord.toDouble();
          if (coord is double) return coord;
          if (coord is String) return double.tryParse(coord) ?? 0.0;
          return 0.0;
        }).toList();
      }
    } catch (e) {
      print('Error parsing coordinates: $e');
    }

    // Safely parse priority (handle both int and String types)
    int priority = 5;
    try {
      if (json['priority'] is int) {
        priority = json['priority'];
      } else if (json['priority'] is String) {
        priority = int.tryParse(json['priority']) ?? 5;
      }
    } catch (e) {
      print('Error parsing priority: $e');
    }

    // Safely parse upvote count (handle both int and String types)
    int upvoteCount = 0;
    try {
      if (json['upvote'] is int) {
        upvoteCount = json['upvote'];
      } else if (json['upvote'] is String) {
        upvoteCount = int.tryParse(json['upvote']) ?? 0;
      }
    } catch (e) {
      print('Error parsing upvote count: $e');
    }

    // Safely parse assignedOfficerId (handle both String and Map types)
    String? assignedOfficerId;
    String? assignedOfficerName;
    try {
      if (json['assignedOfficerId'] is String) {
        assignedOfficerId = json['assignedOfficerId'];
      } else if (json['assignedOfficerId'] is Map<String, dynamic>) {
        assignedOfficerId = json['assignedOfficerId']['_id'];
        assignedOfficerName:
        json['assignedOfficerId']?['fullName'];
      }
    } catch (e) {
      print('Error parsing assigned officer: $e');
    }

    // Safely parse reporterId (handle both String and Map types)
    String reporterId = '';
    try {
      if (json['reporterId'] is String) {
        reporterId = json['reporterId'];
      } else if (json['reporterId'] is Map<String, dynamic>) {
        reporterId = json['reporterId']['_id'] ?? '';
      }
    } catch (e) {
      print('Error parsing reporter ID: $e');
    }

    return Issue(
      id: json['_id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      category: _categoryFromString(json['category']?.toString()),
      status: _statusFromString(json['status']?.toString()),
      priority: priority,
      locationAddress: "", // not provided in your JSON
      coordinates: coordinates,
      assignedOfficerId: assignedOfficerId,
      assignedOfficerName: assignedOfficerName,
      reporterId: reporterId,
      channel: json['channel']?.toString() ?? '',
      createdAt:
          DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
      slaDueDate:
          DateTime.tryParse(json['slaDueDate']?.toString() ?? '') ??
          DateTime.now(),
      upvoteCount: upvoteCount,
      media: (json['media'] is List<dynamic>)
          ? (json['media'] as List).map((m) => IssueMedia.fromJson(m)).toList()
          : [],
      statusHistory: (json['statusHistory'] is List<dynamic>)
          ? (json['statusHistory'] as List)
                .map((s) => IssueStatusHistory.fromJson(s))
                .toList()
          : [],
    );
  }
}

/// Media (image/audio/etc.)
const String _baseUrl = "http://10.88.96.88:5000";

class IssueMedia {
  final String url;
  final String type;
  final String role;

  IssueMedia({required this.url, required this.type, required this.role});

  factory IssueMedia.fromJson(Map<String, dynamic> json) {
    final rawUrl = json['url'] ?? '';

    // If the URL is already absolute (http/https), keep it as is
    final fullUrl = rawUrl.startsWith('http')
        ? rawUrl
        : "$_baseUrl/$rawUrl"
              .replaceAll("//", "/")
              .replaceFirst("http:/", "http://")
              .replaceFirst("https:/", "https://");
    print(fullUrl);
    return IssueMedia(
      url: fullUrl,
      type: json['type'] ?? '',
      role: json['role'] ?? '',
    );
  }
}

/// Status history entries
class IssueStatusHistory {
  final String status;
  final String updatedBy;
  final DateTime timestamp;

  IssueStatusHistory({
    required this.status,
    required this.updatedBy,
    required this.timestamp,
  });

  factory IssueStatusHistory.fromJson(Map<String, dynamic> json) {
    return IssueStatusHistory(
      status: json['status'] ?? '',
      updatedBy: json['updatedBy'] ?? '',
      timestamp: DateTime.tryParse(json['timestamp'] ?? '') ?? DateTime.now(),
    );
  }
}

/// Helpers for enums
IssueCategory _categoryFromString(String? value) {
  return IssueCategory.values.firstWhere(
    (e) => e.name.toLowerCase() == (value ?? '').toLowerCase(),
    orElse: () => IssueCategory.roads,
  );
}

IssueStatus _statusFromString(String? value) {
  return IssueStatus.values.firstWhere(
    (e) => e.name.toLowerCase() == (value ?? '').toLowerCase(),
    orElse: () => IssueStatus.submitted,
  );
}
