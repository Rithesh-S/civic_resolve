import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:municipal_officer_app/features/inventory/bloc/inventory_event.dart';
import 'package:municipal_officer_app/features/inventory/bloc/inventory_state.dart';
import 'package:municipal_officer_app/features/inventory/models/expense_request_model.dart';
import 'package:municipal_officer_app/features/inventory/models/inventory_item_model.dart';

Future<List<InventoryItem>> _fetchInventoryItems(String? token) async {
  final url =
      Uri.parse('http://10.223.140.88:5000/api/inventory'); // Your IP/domain
  final response = await http.get(
    url,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': '$token',
    },
  );

  if (response.statusCode == 200) {
    final responseBody = json.decode(response.body);
    final List<dynamic> itemsJson = responseBody['inventory'];
    return itemsJson.map((json) => InventoryItem.fromJson(json)).toList();
  } else {
    throw Exception('Failed to load inventory items');
  }
}

Future<List<ExpenseRequest>> _fetchExpenseRequests(String? token) async {
  // ✅ The placeholder is now replaced with the real API call
  print("object");
  final url = Uri.parse(
      'http://10.223.140.88:5000/api/officer/expenses'); // Your IP/domain

  final response = await http.get(
    url,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': '$token',
    },
  );

  if (response.statusCode == 200) {
    final responseBody = json.decode(response.body);
    final List<dynamic> requestsJson = responseBody['expenses'];
    print(requestsJson);
    // Use the new fromJson constructor to parse the data
    return requestsJson.map((json) => ExpenseRequest.fromJson(json)).toList();
  } else {
    throw Exception('Failed to load expense requests');
  }
}

class InventoryBloc extends Bloc<InventoryEvent, InventoryState> {
  InventoryBloc() : super(InventoryInitial()) {
    on<FetchInventoryData>((event, emit) async {
      emit(InventoryLoading());
      try {
        const storage = FlutterSecureStorage();
        final token = await storage.read(key: 'userId');

        // Use Future.wait to run both API calls in parallel
        final results = await Future.wait([
          _fetchInventoryItems(token),
          _fetchExpenseRequests(token),
        ]);

        final items = results[0] as List<InventoryItem>;
        final requests = results[1] as List<ExpenseRequest>;

        emit(InventoryLoaded(items: items, requests: requests));
      } catch (e) {
        emit(InventoryError(e.toString()));
      }
    });

    on<SubmitInventoryRequest>((event, emit) async {
      emit(InventorySubmitting());
      try {
        // 1. Transform the cart data to match the backend's expected JSON
        final itemsForApi = event.cart.entries.map((entry) {
          return {
            'inventoryId':
                entry.key.id, // Assuming your InventoryItem model has an 'id'
            'quantity': entry.value,
          };
        }).toList();

        final url = Uri.parse(
            'http://10.223.140.88:5000/api/officer/issues/${event.issueId}/expenses');

        const storage = FlutterSecureStorage();
        final token = await storage.read(key: 'userId');

        // 2. Make the POST request
        final response = await http.post(
          url,
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'x-user-id': '$token',
          },
          body: json.encode({
            'items': itemsForApi,
          }),
        );

        // 3. Handle the response
        if (response.statusCode == 201) {
          emit(InventorySubmitSuccess());
          // After success, re-fetch the data to get the updated list of requests
          add(FetchInventoryData());
        } else {
          final error = json.decode(response.body)['error'] ??
              'Failed to submit request.';
          emit(InventorySubmitFailure(error));
        }
      } catch (e) {
        emit(InventorySubmitFailure(e.toString()));
      }
    });
  }
}
