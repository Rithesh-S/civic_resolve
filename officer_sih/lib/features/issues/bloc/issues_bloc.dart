import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:municipal_officer_app/features/issues/bloc/issues_event.dart';
import 'package:municipal_officer_app/features/issues/bloc/issues_state.dart';
import 'package:municipal_officer_app/features/issues/models/issue_model.dart';

List<Issue> _parseIssues(String responseBody) {
  final responseMap = json.decode(responseBody) as Map<String, dynamic>;
  final List<dynamic> issuesJson = responseMap['issues'];
  return issuesJson.map((json) => Issue.fromJson(json)).toList();
}

class IssuesBloc extends Bloc<IssuesEvent, IssuesState> {
  IssuesBloc() : super(IssuesInitial()) {
    // Add this new event handler inside the IssuesBloc's constructor
    on<FetchIssues>((event, emit) async {
      emit(IssuesLoading());
      try {
        // NOTE: Replace with your actual API base URL
        final url = Uri.parse('http://10.223.140.88:5000/api/officer/issues');

        // You'll need to send the user's auth token for req.user to work
        // This is a placeholder for how you might get a token
        const storage = FlutterSecureStorage();
        final token = await storage.read(key: 'userId');

        final response = await http.get(
          url,
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': '$token',
          },
        );

        if (response.statusCode == 200) {
          final issues = await compute(_parseIssues, response.body);
          emit(IssuesLoaded(issues));
        } else {
          emit(const IssuesError("Failed to load issues."));
        }
      } catch (e) {
        emit(IssuesError(e.toString()));
      }
    });

    // Add this handler to your IssuesBloc constructor
    on<UpdateIssueStatus>((event, emit) async {
      final currentState = state;
      if (currentState is! IssuesLoaded) return; // Guard clause

      // 1. Save the original list for potential rollback on error
      final originalIssues = List<Issue>.from(currentState.issues);

      // 2. Perform an "optimistic" UI update immediately
      final updatedIssues = currentState.issues.map((issue) {
        if (issue.id == event.issueId) {
          // Use the copyWith method from your model
          return issue.copyWith(status: event.newStatus);
        }
        return issue;
      }).toList();

      try {
        // 3. Make the actual API call to the backend
        final url = Uri.parse(
            'http://10.223.140.88:5000/api/officer/issues/${event.issueId}/status'); // Your URL

        const storage = FlutterSecureStorage();
        final token = await storage.read(key: 'userId');

        // Convert the enum status to the string your backend expects (e.g., "in_progress")
        final statusString = event.newStatus.name;

        final response = await http.patch(
          url,
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'x-user-id': '$token',
          },
          body: json.encode({
            'status': statusString,
          }),
        );

        // 4. Check if the API call was unsuccessful
        if (response.statusCode != 200) {
          throw Exception('Failed to update status on the server.');
        }
        // If successful, we don't need to do anything else, as the UI is already updated.
        emit(IssuesLoaded(updatedIssues));
      } catch (e) {
        // 5. If an error occurred, roll back the state to the original list
        emit(IssuesLoaded(originalIssues));
        // Optionally, you can emit an error state or use a listener to show a SnackBar
        // to inform the user that the update failed.
      }
    });
  }
}
