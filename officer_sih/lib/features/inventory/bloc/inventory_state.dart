import 'package:equatable/equatable.dart';
import 'package:municipal_officer_app/features/inventory/models/expense_request_model.dart';
import 'package:municipal_officer_app/features/inventory/models/inventory_item_model.dart';

abstract class InventoryState extends Equatable {
  const InventoryState();
  @override
  List<Object> get props => [];
}

class InventoryInitial extends InventoryState {}

class InventoryLoading extends InventoryState {}

class InventoryLoaded extends InventoryState {
  final List<InventoryItem> items;
  final List<ExpenseRequest> requests;

  const InventoryLoaded({required this.items, required this.requests});

  @override
  List<Object> get props => [items, requests];
}

class InventorySubmitting extends InventoryState {}

class InventorySubmitSuccess extends InventoryState {}

class InventorySubmitFailure extends InventoryState {
  final String error;
  const InventorySubmitFailure(this.error);
  @override
  List<Object> get props => [error];
}

class InventoryError extends InventoryState {
  final String message;
  const InventoryError(this.message);
   @override
  List<Object> get props => [message];
}