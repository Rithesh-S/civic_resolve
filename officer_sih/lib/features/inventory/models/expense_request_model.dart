import 'package:equatable/equatable.dart';

// Enum for the status
enum RequestStatus { requested, approved, rejected, billed }

// Helper class for the nested items in a request
class ExpenseItem extends Equatable {
  final String inventoryId;
  final String name;
  final int quantity;
  final double totalCost;

  const ExpenseItem({
    required this.inventoryId,
    required this.name,
    required this.quantity,
    required this.totalCost,
  });

  factory ExpenseItem.fromJson(Map<String, dynamic> json) {
    return ExpenseItem(
      inventoryId: json['inventoryId'] as String,
      name: json['name'] as String,
      quantity: (json['quantity'] as num).toInt(),
      totalCost: (json['totalCost'] as num).toDouble(),
    );
  }

  @override
  List<Object?> get props => [inventoryId, name, quantity];
}

// Helper class for the populated issue data
class IssueInfo extends Equatable {
  final String id;
  final String title;

  const IssueInfo({required this.id, required this.title});

  factory IssueInfo.fromJson(Map<String, dynamic> json) {
    return IssueInfo(
      id: json['_id'] as String,
      title: json['title'] as String,
    );
  }
   @override
  List<Object?> get props => [id, title];
}


// The main, updated ExpenseRequest class
class ExpenseRequest extends Equatable {
  final String id;
  final IssueInfo issue;
  final DateTime requestedAt;
  final RequestStatus status;
  final List<ExpenseItem> items;

  const ExpenseRequest({
    required this.id,
    required this.issue,
    required this.requestedAt,
    required this.status,
    required this.items,
  });

  factory ExpenseRequest.fromJson(Map<String, dynamic> json) {
    // Helper to map string status to enum
    RequestStatus statusFromString(String statusStr) {
      return RequestStatus.values.firstWhere(
        (e) => e.toString().split('.').last == statusStr,
        orElse: () => RequestStatus.requested, // Default value
      );
    }
    
    return ExpenseRequest(
      id: json['_id'] as String,
      issue: IssueInfo.fromJson(json['issueId']),
      requestedAt: DateTime.parse(json['requestedAt'] as String),
      status: statusFromString(json['status']),
      items: (json['items'] as List)
          .map((itemJson) => ExpenseItem.fromJson(itemJson))
          .toList(),
    );
  }
  
  // You can still keep dummy data for testing if needed
  static List<ExpenseRequest> get dummyRequests => [];

  @override
  List<Object?> get props => [id, issue, status];
}