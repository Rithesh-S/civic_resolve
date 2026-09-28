// lib/services/api_service.dart
import 'dart:convert';
import 'dart:io';
import 'package:flutter_application_2/models/issue_model.dart';
import 'package:flutter_application_2/models/notification_model.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http_parser/http_parser.dart'; // Add this import

import 'package:flutter_application_2/services/storage_service.dart';

class ApiService {
  static const String baseUrl = 'http://10.88.96.88:5000/api';
  static Future<String?> _getSessionToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('session_token');
  }

  static Future<String?> _getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_id');
  }

  final StorageService _storageService = StorageService();

  Future<Map<String, dynamic>> getMyIssues({
    int page = 1,
    int limit = 10,
    String status = 'all',
  }) async {
    try {
      final token = await _storageService.getUserId();

      if (token == null) {
        throw Exception('User not authenticated');
      }

      // Build query parameters
      final queryParams = {'page': page.toString(), 'limit': limit.toString()};

      // Add status filter if not 'all'
      if (status != 'all') {
        queryParams['status'] = status;
      }

      final uri = Uri.parse(
        '$baseUrl/citizen/issues',
      ).replace(queryParameters: queryParams);

      final response = await http.get(
        uri,
        headers: {'x-user-id': token, 'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'issues': (data['issues'] as List)
              .map((issue) => Issue.fromJson(issue))
              .toList(),
          'pagination': data['pagination'],
        };
      } else {
        throw Exception('Failed to load issues: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching issues: $e');
    }
  }

  Future<Map<String, dynamic>> getUpvotedIssues({
    int page = 1,
    int limit = 10,
    String status = 'all',
  }) async {
    try {
      // Get authentication token
      final token = await _getUserId();

      // Build query parameters
      final Map<String, String> queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
      };

      // Add status filter if not 'all'
      if (status != 'all') {
        queryParams['status'] = status;
      }

      // Build URI
      final uri = Uri.parse(
        '${baseUrl}/citizen/upvoted-issues',
      ).replace(queryParameters: queryParams);

      // Make API call
      final response = await http.get(
        uri,
        headers: {'x-user-id': '$token', 'Content-Type': 'application/json'},
      );

      // Handle response
      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);

        // Debug: Print the raw response to see the actual structure
        print('Upvoted issues response: $responseData');

        // Check if upvotedIssues exists and is a List
        if (responseData['upvotedIssues'] is! List) {
          return {
            'issues': [],
            'pagination': {'page': page, 'pages': 0, 'total': 0},
          };
        }

        // Parse issues using a safe method
        final List<Issue> upvotedIssues =
            (responseData['upvotedIssues'] as List)
                .map((issueJson) {
                  try {
                    return Issue.fromJson(issueJson);
                  } catch (e) {
                    print('Error parsing issue: $e');
                    print('Issue data: $issueJson');
                    return null;
                  }
                })
                .whereType<Issue>() // Filter out null values
                .toList();

        return {
          'issues': upvotedIssues,
          'pagination': {
            'page': page,
            'pages': 1,
            'total': upvotedIssues.length,
          },
        };
      } else if (response.statusCode == 401) {
        throw Exception('Authentication failed. Please login again.');
      } else if (response.statusCode == 404) {
        // No upvoted issues found
        return {
          'issues': [],
          'pagination': {'page': page, 'pages': 0, 'total': 0},
        };
      } else {
        throw Exception(
          'Failed to load upvoted issues: ${response.statusCode}',
        );
      }
    } catch (e) {
      print('Error in getUpvotedIssues: $e');
      throw Exception('Failed to load upvoted issues: $e');
    }
  }

  // Helper method to parse status string to enum
  IssueStatus _parseStatus(String status) {
    switch (status.toLowerCase()) {
      case 'submitted':
        return IssueStatus.submitted;
      case 'acknowledged':
        return IssueStatus.acknowledged;
      case 'inprogress':
        return IssueStatus.inProgress;
      case 'resolved':
        return IssueStatus.resolved;
      case 'closed':
        return IssueStatus.closed;
      // case 'verified': return IssueStatus.verified;
      default:
        return IssueStatus.submitted;
    }
  }

  Future<Issue> getIssueById(String issueId) async {
    try {
      final userId = await _getUserId();

      if (userId == null) {
        throw Exception('Not authenticated. Please login again.');
      }

      final uri = Uri.parse('$baseUrl/citizen/issues/$issueId');

      final response = await http.get(
        uri,
        headers: {'x-user-id': userId, 'Content-Type': 'application/json'},
      );

      final body = json.decode(response.body);

      switch (response.statusCode) {
        case 200:
          return Issue.fromJson(body['issue']);
        case 404:
          throw Exception(body['error'] ?? 'Issue not found.');
        case 500:
          throw Exception(
            body['error'] ?? 'Server error. Please try again later.',
          );
        default:
          throw Exception('Unexpected error (${response.statusCode}).');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<Map<String, dynamic>> getAllIssues({
    int page = 1,
    int limit = 100,
    String status = 'all',
  }) async {
    try {
      final userId = await _storageService.getUserId();

      if (userId == null) {
        throw Exception('User not authenticated');
      }

      // Build query parameters
      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        'fetchAll': 'true', // must be a string
      };

      if (status != 'all') {
        queryParams['status'] = status;
      }

      final uri = Uri.parse(
        '$baseUrl/citizen/issues',
      ).replace(queryParameters: queryParams);

      final response = await http.get(
        uri,
        headers: {'x-user-id': userId, 'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'issues': (data['issues'] as List)
              .map((issue) => Issue.fromJson(issue))
              .toList(),
          'pagination': data['pagination'],
        };
      } else {
        throw Exception('Failed to load issues: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching issues: $e');
    }
  }

  Future<Map<String, dynamic>> upvoteIssue(String issueId) async {
    try {
      final userId = await _getUserId();
      print(issueId);
      final uri = Uri.parse('$baseUrl/citizen/issues/$issueId/upvote');
      print(uri);
      final response = await http.post(
        uri,
        headers: {'x-user-id': ?userId, 'Content-Type': 'application/json'},
      );

      final data = json.decode(response.body);
      if (response.statusCode == 200) {
        print("helooooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
        return data; // Returns { message, upvotes }
      } else {
        throw Exception(data['error'] ?? 'Failed to upvote issue');
      }
    } catch (e) {
      throw Exception('Error upvoting issue: $e');
    }
  }

  Future<Map<String, dynamic>> getNotifications({
    int page = 1,
    int limit = 15, // A slightly higher limit can be better for lists
    bool unreadOnly = false,
  }) async {
    try {
      final userId = await _getUserId();
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      final queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
        'unreadOnly': unreadOnly.toString(),
      };

      // Ensure your backend router uses this path, e.g., /api/notifications
      final uri = Uri.parse(
        '$baseUrl/notifications',
      ).replace(queryParameters: queryParams);

      final response = await http.get(
        uri,
        headers: {'x-user-id': userId, 'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'notifications': (data['notifications'] as List)
              .map((notif) => AppNotification.fromJson(notif))
              .toList(),
          'pagination': data['pagination'],
          'unreadCount': data['unreadCount'],
        };
      } else {
        throw Exception('Failed to load notifications: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error fetching notifications: $e');
    }
  }

  /// Marks a single notification as read.
  Future<void> markNotificationAsRead(String notificationId) async {
    try {
      final userId = await _getUserId();
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      // Assumes a route like: PATCH /api/notifications/:notificationId
      final uri = Uri.parse('$baseUrl/notifications/$notificationId/read');

      final response = await http.patch(
        // Using PATCH for partial updates
        uri,
        headers: {'x-user-id': userId, 'Content-Type': 'application/json'},
      );

      if (response.statusCode != 200) {
        final data = json.decode(response.body);
        throw Exception(data['error'] ?? 'Failed to mark notification as read');
      }
    } catch (e) {
      throw Exception('Error updating notification: $e');
    }
  }

  /// Marks all unread notifications as read.
  Future<void> markAllNotificationsAsRead() async {
    try {
      final userId = await _getUserId();
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      // Assumes a route like: POST /api/notifications/mark-all-read
      final uri = Uri.parse('$baseUrl/notifications/read-all');

      final response = await http.patch(
        uri,
        headers: {'x-user-id': userId, 'Content-Type': 'application/json'},
      );

      if (response.statusCode != 200) {
        final data = json.decode(response.body);
        throw Exception(data['error'] ?? 'Failed to mark all as read');
      }
    } catch (e) {
      throw Exception('Error updating notifications: $e');
    }
  }

  /// Deletes a single notification by its ID.
  Future<void> deleteNotification(String notificationId) async {
    try {
      final userId = await _getUserId();
      if (userId == null) {
        throw Exception('User not authenticated');
      }

      // Assumes a route like: DELETE /api/notifications/:notificationId
      final uri = Uri.parse('$baseUrl/notifications/$notificationId');

      final response = await http.delete(
        uri,
        headers: {'x-user-id': userId, 'Content-Type': 'application/json'},
      );

      if (response.statusCode != 200) {
        final data = json.decode(response.body);
        throw Exception(data['error'] ?? 'Failed to delete notification');
      }
    } catch (e) {
      throw Exception('Error deleting notification: $e');
    }
  }

  /// Submits feedback for a resolved issue.
  Future<void> provideFeedback({
    required String issueId,
    required int rating,
    String? comment,
  }) async {
    try {
      final userId = await _getUserId();
      final uri = Uri.parse('$baseUrl/citizen/issues/$issueId/feedback');
      final response = await http.post(
        uri,
        headers: {'x-user-id': ?userId, 'Content-Type': 'application/json'},
        body: json.encode({'rating': rating, 'comment': comment}),
      );

      if (response.statusCode != 200) {
        final data = json.decode(response.body);
        throw Exception(data['error'] ?? 'Failed to submit feedback');
      }
    } catch (e) {
      throw Exception('Error submitting feedback: $e');
    }
  }

  // Report issue with multiple files
  static Future<Map<String, dynamic>> reportIssue({
    required String title,
    required String description,
    required String category,
    required Map<String, dynamic> location,
    List<File>? images,
    List<File>? audioFiles,
    String channel = 'app',
  }) async {
    try {
      final sessionToken = await _getSessionToken();
      final userId = await _getUserId();

      if (sessionToken == null || userId == null) {
        return {
          'success': false,
          'message': 'Not authenticated. Please login again.',
        };
      }

      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/citizen/issues'),
      );

      // headers
      request.headers['x-user-id'] = userId;

      // fields
      request.fields['title'] = title;
      request.fields['description'] = description;
      request.fields['category'] = category;
      request.fields['location'] = json.encode(location);
      request.fields['channel'] = channel;

      // images
      if (images != null && images.isNotEmpty) {
        for (var i = 0; i < images.length; i++) {
          var file = images[i];
          var multipartFile = await http.MultipartFile.fromPath(
            'images',
            file.path,
            filename: 'image_$i${_getImageExtension(file.path)}',
            contentType: MediaType('image', 'jpeg'),
          );
          request.files.add(multipartFile);
        }
      }

      // audio
      if (audioFiles != null && audioFiles.isNotEmpty) {
        for (var i = 0; i < audioFiles.length; i++) {
          var file = audioFiles[i];
          var multipartFile = await http.MultipartFile.fromPath(
            'audio',
            file.path,
            filename: 'audio_$i${_getAudioExtension(file.path)}',
            contentType: MediaType('audio', 'm4a'),
          );
          request.files.add(multipartFile);
        }
      }

      // send
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      final body = json.decode(response.body);
      print(response.statusCode);
      switch (response.statusCode) {
        case 201:
          return {
            'success': true,
            'message': body['message'] ?? 'Issue reported successfully',
            'data': body,
          };
        case 200: // duplicate issue handled
          print(body);
          return {
            'success': true,
            'duplicate': true,
            'message': body['message'] ?? 'This issue is marked as duplicate.',
            'data': body,
          };
        case 400:
          return {
            'success': false,
            'message':
                body['error'] ?? 'Bad request. Please check your inputs.',
          };
        case 401:
          return {
            'success': false,
            'message': 'Unauthorized. Please login again.',
          };
        case 404:
          return {
            'success': false,
            'message': body['error'] ?? 'Resource not found.',
          };
        case 500:
          return {
            'success': false,
            'message': 'Server error. Please try again later.',
          };
        default:
          return {
            'success': false,
            'message': 'Unexpected error (${response.statusCode}).',
          };
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }

  // Helper function to get image extension
  static String _getImageExtension(String path) {
    final ext = path.split('.').last.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].contains(ext)) {
      return '.$ext';
    }
    return '.jpg'; // Default to jpg
  }

  // Helper function to get audio extension
  static String _getAudioExtension(String path) {
    final ext = path.split('.').last.toLowerCase();
    if (['m4a', 'mp3', 'wav', 'aac'].contains(ext)) {
      return '.$ext';
    }
    return '.m4a'; // Default to m4a
  }

  // Register method (existing)
  static Future<Map<String, dynamic>> registerUser({
    required String fullName,
    required String email,
    required String phone,
    required String password,
    required String role,
    String preferredLanguage = 'en',
    Map<String, dynamic>? officerProfile,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'fullName': fullName,
          'email': email,
          'phone': phone,
          'password': password,
          'role': role,
          'preferredLanguage': preferredLanguage,
        }),
      );

      if (response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['error'] ?? 'Registration failed');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Login method (new)
  static Future<Map<String, dynamic>> loginUser({
    required String phone,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'phone': phone, 'password': password}),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['error'] ?? 'Login failed');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
}
