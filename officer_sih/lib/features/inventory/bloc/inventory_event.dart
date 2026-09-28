import 'package:equatable/equatable.dart';
import 'package:municipal_officer_app/features/inventory/models/inventory_item_model.dart';

abstract class InventoryEvent extends Equatable {
  const InventoryEvent();
  @override
  List<Object> get props => [];
}

class SubmitInventoryRequest extends InventoryEvent {
  final String issueId;
  final String issueTitle; // For display purposes
  final Map<InventoryItem, int> cart;

  const SubmitInventoryRequest({
    required this.issueId,
    required this.issueTitle,
    required this.cart
  });

  @override
  List<Object> get props => [issueId, cart];
}

class FetchInventoryData extends InventoryEvent {}