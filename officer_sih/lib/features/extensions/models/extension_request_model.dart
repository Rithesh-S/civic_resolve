import 'package:equatable/equatable.dart';

enum ExtensionStatus { pending, approved, rejected }

class ExtensionRequest extends Equatable {
  final String id;
  final String issueId;
  final String newDueDate;
  final ExtensionStatus status;

  const ExtensionRequest({
    required this.id,
    required this.issueId,
    required this.newDueDate,
    required this.status,
  });

  ExtensionRequest copyWith({ExtensionStatus? status}) {
    return ExtensionRequest(
      id: id,
      issueId: issueId,
      newDueDate: newDueDate,
      status: status ?? this.status,
    );
  }
  
  @override
  List<Object?> get props => [id, issueId, status];
}