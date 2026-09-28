import 'package:equatable/equatable.dart';
import 'package:municipal_officer_app/features/issues/models/issue_model.dart';

abstract class IssuesEvent extends Equatable {
  const IssuesEvent();
  @override
  List<Object> get props => [];
}

class UpdateIssueStatus extends IssuesEvent {
  final String issueId;
  final IssueStatus newStatus;

  const UpdateIssueStatus({required this.issueId, required this.newStatus});

  @override
  List<Object> get props => [issueId, newStatus];
}

// Add this class to the file
class UpdateSlaDate extends IssuesEvent {
  final String issueId;
  final String newSlaDate;
  const UpdateSlaDate({required this.issueId, required this.newSlaDate});
}

class FetchIssues extends IssuesEvent {}