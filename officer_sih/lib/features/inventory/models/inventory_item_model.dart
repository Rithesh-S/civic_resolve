import 'package:equatable/equatable.dart';

class InventoryItem extends Equatable {
  final String id;
  final String name;
  final String description;
  final String category;
  final int availableCount;
  final String unit;
  final double unitCost;

  const InventoryItem({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.availableCount,
    required this.unit,
    required this.unitCost,
  });

  factory InventoryItem.fromJson(Map<String, dynamic> json) {
    return InventoryItem(
      id: json['_id'] as String,
      name: json['name'] as String,
      description: json['description'] as String? ?? '',
      category: json['category'] as String,
      availableCount: (json['availableCount'] as num).toInt(),
      unit: json['unit'] as String? ?? 'units',
      unitCost: (json['unitCost'] as num).toDouble(),
    );
  }

  @override
  List<Object?> get props => [id, name, availableCount, unit];
}