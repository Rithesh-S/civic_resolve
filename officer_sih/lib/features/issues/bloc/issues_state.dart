import 'package:equatable/equatable.dart';
import 'package:municipal_officer_app/features/issues/models/issue_model.dart';

abstract class IssuesState extends Equatable {
  const IssuesState();
  @override
  List<Object> get props => [];
}

class IssuesInitial extends IssuesState {}

class IssuesLoading extends IssuesState {}


class IssuesLoaded extends IssuesState {
  final List<Issue> issues;
  const IssuesLoaded(this.issues);

  @override
  List<Object> get props => [issues];
}

class IssuesError extends IssuesState {
  final String message;
  const IssuesError(this.message);

  @override
  List<Object> get props => [message];
}