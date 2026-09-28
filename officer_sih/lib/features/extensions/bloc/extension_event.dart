import 'package:equatable/equatable.dart';

abstract class ExtensionEvent extends Equatable {
  const ExtensionEvent();
  @override
  List<Object> get props => [];
}

class FetchExtensionRequests extends ExtensionEvent {}

class AddExtensionRequest extends ExtensionEvent {
  final String issueId;
  final DateTime requestedUntil;
  final String reason;

  const AddExtensionRequest({
    required this.issueId,
    required this.requestedUntil,
    required this.reason,
  });

  @override
  List<Object> get props => [issueId, requestedUntil, reason];
}