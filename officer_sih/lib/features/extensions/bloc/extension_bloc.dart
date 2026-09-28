import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:municipal_officer_app/features/extensions/bloc/extension_event.dart';
import 'package:municipal_officer_app/features/extensions/bloc/extension_state.dart';

class ExtensionBloc extends Bloc<ExtensionEvent, ExtensionState> {
  ExtensionBloc() : super(ExtensionInitial()) {
    on<FetchExtensionRequests>((event, emit) {
      // In a real app, this would be an API call. For now, we start with an empty list.
      emit(const ExtensionLoaded([]));
    });

    on<AddExtensionRequest>((event, emit) async {
      emit(ExtensionSubmitting());
      try {
        final url = Uri.parse(
            'http://10.223.140.88:5000/api/officer/issues/${event.issueId}/extensions');

        const storage = FlutterSecureStorage();
        final token = await storage.read(key: 'userId');

        final response = await http.post(
          url,
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'x-user-id': '$token',
          },
          body: json.encode({
            'requestedUntil': event.requestedUntil.toIso8601String(),
            'reason': event.reason,
          }),
        );

        if (response.statusCode == 201) {
          emit(ExtensionSubmitSuccess());
          // Refresh the list of requests after a successful submission
          add(FetchExtensionRequests());
        } else {
          final error = json.decode(response.body)['error'] ??
              'Failed to submit request.';
          emit(ExtensionSubmitFailure(error));
        }
      } catch (e) {
        print(e);
        emit(ExtensionSubmitFailure(e.toString()));
      }
    });
  }
}
